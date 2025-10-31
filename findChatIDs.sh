#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

# Load environment variables from .env file
if [ ! -f .env ]; then
    echo -e "${RED}Error: .env file not found!${NC}"
    echo "Please create a .env file with your Azure AD credentials."
    exit 1
fi

# Source the .env file
set -a
source .env
set +a

# Check required variables
if [ -z "$TENANT_ID" ] || [ -z "$CLIENT_ID" ]; then
    echo -e "${RED}Error: TENANT_ID and CLIENT_ID must be set in .env${NC}"
    exit 1
fi

# Function to get access token based on auth mode
get_access_token() {
    local AUTH_MODE=${AUTH_MODE:-delegated}
    
    if [ "$AUTH_MODE" = "application" ]; then
        if [ -z "$CLIENT_SECRET" ]; then
            echo -e "${RED}Error: CLIENT_SECRET required for application auth mode${NC}"
            exit 1
        fi
        
        echo -e "${CYAN}Acquiring access token (application mode)...${NC}"
        
        local TOKEN_RESPONSE=$(curl -s --max-time 30 -X POST \
            "https://login.microsoftonline.com/$TENANT_ID/oauth2/v2.0/token" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "client_id=$CLIENT_ID" \
            -d "scope=https://graph.microsoft.com/.default" \
            -d "client_secret=$CLIENT_SECRET" \
            -d "grant_type=client_credentials")
        
        local CURL_EXIT=$?
        if [ $CURL_EXIT -eq 28 ]; then
            echo -e "${RED}Request timed out after 30 seconds${NC}"
            exit 1
        elif [ $CURL_EXIT -ne 0 ]; then
            echo -e "${RED}Network error (curl exit code: $CURL_EXIT)${NC}"
            exit 1
        fi
        
        local ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
        
        if [ -z "$ACCESS_TOKEN" ]; then
            echo -e "${RED}Failed to acquire access token${NC}"
            echo "$TOKEN_RESPONSE" | grep -o '"error_description":"[^"]*' | cut -d'"' -f4
            exit 1
        fi
        
        echo "$ACCESS_TOKEN"
    else
        # Delegated auth mode
        echo -e "${CYAN}Requesting device code for authentication...${NC}"
        
        local DEVICE_CODE_RESPONSE=$(curl -s --max-time 30 -X POST \
            "https://login.microsoftonline.com/$TENANT_ID/oauth2/v2.0/devicecode" \
            -H "Content-Type: application/x-www-form-urlencoded" \
            -d "client_id=$CLIENT_ID" \
            -d "scope=https://graph.microsoft.com/ChatMessage.Read https://graph.microsoft.com/Chat.Read https://graph.microsoft.com/ChannelMessage.Read.All https://graph.microsoft.com/User.Read offline_access")
        
        local CURL_EXIT=$?
        if [ $CURL_EXIT -eq 28 ]; then
            echo -e "${RED}Request timed out after 30 seconds${NC}"
            exit 1
        elif [ $CURL_EXIT -ne 0 ]; then
            echo -e "${RED}Network error (curl exit code: $CURL_EXIT)${NC}"
            exit 1
        fi
        
        local USER_CODE=$(echo "$DEVICE_CODE_RESPONSE" | grep -o '"user_code":"[^"]*' | cut -d'"' -f4)
        local DEVICE_CODE=$(echo "$DEVICE_CODE_RESPONSE" | grep -o '"device_code":"[^"]*' | cut -d'"' -f4)
        local VERIFICATION_URL=$(echo "$DEVICE_CODE_RESPONSE" | grep -o '"verification_uri":"[^"]*' | cut -d'"' -f4)
        local EXPIRES_IN=$(echo "$DEVICE_CODE_RESPONSE" | grep -o '"expires_in":[0-9]*' | cut -d':' -f2)
        
        if [ -z "$USER_CODE" ] || [ -z "$DEVICE_CODE" ]; then
            echo -e "${RED}Failed to request device code${NC}"
            echo "$DEVICE_CODE_RESPONSE"
            exit 1
        fi
        
        echo -e "\n${YELLOW}${BOLD}🔐 User Authentication Required${NC}"
        echo -e "${BOLD}1.${NC} Open your browser to: ${CYAN}$VERIFICATION_URL${NC}"
        echo -e "${BOLD}2.${NC} Enter this code: ${GREEN}${BOLD}$USER_CODE${NC}\n"
        echo -e "${CYAN}Waiting for authentication...${NC}"
        
        # Poll for token
        local INTERVAL=5
        local EXPIRE_TIME=$(($(date +%s) + EXPIRES_IN))
        local POLL_COUNT=0
        
        while [ $(date +%s) -lt $EXPIRE_TIME ]; do
            sleep $INTERVAL
            POLL_COUNT=$((POLL_COUNT + 1))
            
            # Show progress every 3 polls (15 seconds)
            if [ $((POLL_COUNT % 3)) -eq 0 ]; then
                echo -e "${CYAN}Still waiting for authentication... (${POLL_COUNT} attempts)${NC}"
            fi
            
            local TOKEN_RESPONSE=$(curl -s --max-time 30 -X POST \
                "https://login.microsoftonline.com/$TENANT_ID/oauth2/v2.0/token" \
                -H "Content-Type: application/x-www-form-urlencoded" \
                -d "client_id=$CLIENT_ID" \
                -d "grant_type=urn:ietf:params:oauth:grant-type:device_code" \
                -d "device_code=$DEVICE_CODE")
            
            local CURL_EXIT=$?
            if [ $CURL_EXIT -eq 28 ]; then
                echo -e "${YELLOW}Warning: Request timed out, retrying...${NC}"
                continue
            elif [ $CURL_EXIT -ne 0 ]; then
                echo -e "${YELLOW}Warning: Network error, retrying...${NC}"
                continue
            fi
            
            local ACCESS_TOKEN=$(echo "$TOKEN_RESPONSE" | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)
            
            if [ -n "$ACCESS_TOKEN" ]; then
                echo -e "${GREEN}✓ Authentication successful!${NC}\n"
                echo "$ACCESS_TOKEN"
                return
            fi
            
            local ERROR=$(echo "$TOKEN_RESPONSE" | grep -o '"error":"[^"]*' | cut -d'"' -f4)
            
            if [ "$ERROR" != "authorization_pending" ] && [ "$ERROR" != "slow_down" ]; then
                echo -e "${RED}Authentication failed: $ERROR${NC}"
                exit 1
            fi
        done
        
        echo -e "${RED}Authentication timed out${NC}"
        exit 1
    fi
}

# Function to fetch user details
get_user_details() {
    local ACCESS_TOKEN=$1
    local USER_ID=$2
    
    local USER_RESPONSE=$(curl -s -X GET \
        "https://graph.microsoft.com/v1.0/users/$USER_ID" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    local DISPLAY_NAME=$(echo "$USER_RESPONSE" | grep -o '"displayName":"[^"]*' | cut -d'"' -f4)
    echo "$DISPLAY_NAME"
}

# Function to fetch chats
fetch_chats() {
    local ACCESS_TOKEN=$1
    
    echo -e "${CYAN}Fetching your chats from Microsoft Graph API...${NC}"
    
    local CHATS_RESPONSE=$(curl -s --max-time 60 -X GET \
        "https://graph.microsoft.com/v1.0/me/chats" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    local CURL_EXIT=$?
    if [ $CURL_EXIT -eq 28 ]; then
        echo -e "${RED}Error: Request timed out after 60 seconds${NC}"
        echo -e "${YELLOW}This may indicate a network issue or the API is slow to respond.${NC}"
        exit 1
    elif [ $CURL_EXIT -ne 0 ]; then
        echo -e "${RED}Error: Network error (curl exit code: $CURL_EXIT)${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✓ Chats retrieved successfully${NC}"
    echo -e "${CYAN}Parsing chat data...${NC}"
    
    # Check for errors
    if echo "$CHATS_RESPONSE" | grep -q '"error"'; then
        echo -e "${RED}Failed to fetch chats:${NC}"
        echo "$CHATS_RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4
        exit 1
    fi
    
    # Save response to temp file for processing
    echo "$CHATS_RESPONSE" > /tmp/chats_response.tmp
    
    # Use Python to parse JSON properly
    python3 << 'PYTHON_SCRIPT' 2>/tmp/python_error.tmp
import json
import sys

try:
    with open('/tmp/chats_response.tmp', 'r') as f:
        data = json.load(f)
    
    chats = data.get('value', [])
    
    with open('/tmp/chat_ids.tmp', 'w') as id_file, \
         open('/tmp/chat_types.tmp', 'w') as type_file, \
         open('/tmp/chat_topics.tmp', 'w') as topic_file:
        
        for chat in chats:
            chat_id = chat.get('id', '')
            chat_type = chat.get('chatType', '')
            topic = chat.get('topic', '')
            
            id_file.write(chat_id + '\n')
            type_file.write(chat_type + '\n')
            topic_file.write(topic + '\n')
    
    with open('/tmp/chat_count.tmp', 'w') as f:
        f.write(str(len(chats)))
    
except Exception as e:
    print(f"Error parsing JSON: {e}", file=sys.stderr)
    sys.exit(1)
PYTHON_SCRIPT
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}Failed to parse chat data${NC}"
        if [ -f /tmp/python_error.tmp ]; then
            cat /tmp/python_error.tmp
        fi
        exit 1
    fi
    
    echo -e "${GREEN}✓ Chat data parsed successfully${NC}\n"
    
    # Read the arrays
    mapfile -t CHAT_IDS < /tmp/chat_ids.tmp
    mapfile -t CHAT_TYPES < /tmp/chat_types.tmp
    mapfile -t CHAT_TOPICS < /tmp/chat_topics.tmp
    local CHAT_COUNT=$(cat /tmp/chat_count.tmp)
    
    # Display chats
    echo -e "${CYAN}Processing chat details...${NC}"
    local ONEONONE_COUNT=0
    
    for i in "${!CHAT_IDS[@]}"; do
        local NUM=$((i + 1))
        local CHAT_ID="${CHAT_IDS[$i]}"
        local CHAT_TYPE="${CHAT_TYPES[$i]}"
        local TOPIC="${CHAT_TOPICS[$i]}"
        
        # If topic is empty and it's a oneOnOne chat, fetch the other user's name
        if [ -z "$TOPIC" ] && [ "$CHAT_TYPE" = "oneOnOne" ]; then
            ONEONONE_COUNT=$((ONEONONE_COUNT + 1))
            
            # Show progress for 1:1 chats
            if [ $ONEONONE_COUNT -eq 1 ]; then
                echo -e "${CYAN}Fetching user names for 1:1 chats...${NC}"
            fi
            
            # Fetch members to get the other user
            local MEMBERS_RESPONSE=$(curl -s --max-time 30 -X GET \
                "https://graph.microsoft.com/v1.0/me/chats/$CHAT_ID/members" \
                -H "Authorization: Bearer $ACCESS_TOKEN")
            
            if [ $? -ne 0 ]; then
                echo -e "${YELLOW}Warning: Failed to fetch members for chat $NUM${NC}"
            fi
            
            # Parse member response with Python
            echo "$MEMBERS_RESPONSE" > /tmp/members_response.tmp
            
            local OTHER_USER_ID=$(python3 << 'PYTHON_SCRIPT2'
import json
try:
    with open('/tmp/members_response.tmp', 'r') as f:
        data = json.load(f)
    members = data.get('value', [])
    # Get second member (first is usually current user)
    if len(members) >= 2:
        print(members[1].get('userId', ''))
    elif len(members) == 1:
        print(members[0].get('userId', ''))
except:
    pass
PYTHON_SCRIPT2
)
            
            if [ -n "$OTHER_USER_ID" ]; then
                local USER_NAME=$(get_user_details "$ACCESS_TOKEN" "$OTHER_USER_ID")
                TOPIC="[1:1] $USER_NAME"
            else
                TOPIC="[1:1 Chat]"
            fi
        elif [ -z "$TOPIC" ]; then
            TOPIC="[Unnamed $CHAT_TYPE]"
        fi
        
        echo -e "${GREEN}${NUM}.${NC} ${BOLD}$TOPIC${NC}"
        echo -e "   ${CYAN}ID:${NC} $CHAT_ID"
        echo ""
    done
    
    echo -e "${GREEN}✓ Found ${CHAT_COUNT} chat(s)${NC}\n"
}

# Function to fetch channels
fetch_channels() {
    local ACCESS_TOKEN=$1
    
    echo -e "${CYAN}Fetching your teams from Microsoft Graph API...${NC}"
    
    local TEAMS_RESPONSE=$(curl -s --max-time 60 -X GET \
        "https://graph.microsoft.com/v1.0/me/joinedTeams" \
        -H "Authorization: Bearer $ACCESS_TOKEN")
    
    local CURL_EXIT=$?
    if [ $CURL_EXIT -eq 28 ]; then
        echo -e "${RED}Error: Request timed out after 60 seconds${NC}"
        exit 1
    elif [ $CURL_EXIT -ne 0 ]; then
        echo -e "${RED}Error: Network error (curl exit code: $CURL_EXIT)${NC}"
        exit 1
    fi
    
    # Check for errors
    if echo "$TEAMS_RESPONSE" | grep -q '"error"'; then
        echo -e "${RED}Failed to fetch teams:${NC}"
        echo "$TEAMS_RESPONSE" | grep -o '"message":"[^"]*' | cut -d'"' -f4
        exit 1
    fi
    
    echo -e "${GREEN}✓ Teams retrieved successfully${NC}"
    echo -e "${CYAN}Parsing team data...${NC}"
    
    # Parse teams with Python
    echo "$TEAMS_RESPONSE" > /tmp/teams_response.tmp
    
    python3 << 'PYTHON_SCRIPT'
import json
try:
    with open('/tmp/teams_response.tmp', 'r') as f:
        data = json.load(f)
    teams = data.get('value', [])
    with open('/tmp/team_ids_list.tmp', 'w') as f:
        for team in teams:
            f.write(team.get('id', '') + '\n')
except:
    pass
PYTHON_SCRIPT
    
    # Clear temp files
    > /tmp/team_ids.tmp
    > /tmp/channel_ids.tmp
    > /tmp/team_names.tmp
    > /tmp/channel_names.tmp
    
    local CHANNEL_COUNT=0
    
    # Read team IDs
    if [ ! -f /tmp/team_ids_list.tmp ]; then
        echo -e "${YELLOW}No teams found${NC}"
        return
    fi
    
    local TEAM_NUM=0
    local TOTAL_TEAMS=$(wc -l < /tmp/team_ids_list.tmp 2>/dev/null || echo "0")
    
    echo -e "${CYAN}Fetching channels for $TOTAL_TEAMS team(s)...${NC}"
    
    while IFS= read -r TEAM_ID; do
        [ -z "$TEAM_ID" ] && continue
        
        TEAM_NUM=$((TEAM_NUM + 1))
        echo -e "${CYAN}Processing team $TEAM_NUM of $TOTAL_TEAMS...${NC}"
        
        # Fetch team details
        local TEAM_RESPONSE=$(curl -s --max-time 30 -X GET \
            "https://graph.microsoft.com/v1.0/teams/$TEAM_ID" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}Warning: Failed to fetch team $TEAM_NUM details${NC}"
            continue
        fi
        
        echo "$TEAM_RESPONSE" > /tmp/team_response.tmp
        
        local TEAM_NAME=$(python3 << 'PYTHON_SCRIPT2'
import json
try:
    with open('/tmp/team_response.tmp', 'r') as f:
        data = json.load(f)
    print(data.get('displayName', 'Unknown Team'))
except:
    print('Unknown Team')
PYTHON_SCRIPT2
)
        
        # Fetch channels for this team
        local CHANNELS_RESPONSE=$(curl -s --max-time 30 -X GET \
            "https://graph.microsoft.com/v1.0/teams/$TEAM_ID/channels" \
            -H "Authorization: Bearer $ACCESS_TOKEN")
        
        if [ $? -ne 0 ]; then
            echo -e "${YELLOW}Warning: Failed to fetch channels for team $TEAM_NUM${NC}"
            continue
        fi
        
        echo "$CHANNELS_RESPONSE" > /tmp/channels_response.tmp
        
        # Parse channels with Python and display
        python3 << PYTHON_SCRIPT3
import json
try:
    with open('/tmp/channels_response.tmp', 'r') as f:
        data = json.load(f)
    channels = data.get('value', [])
    
    for channel in channels:
        channel_id = channel.get('id', '')
        channel_name = channel.get('displayName', '')
        
        # Append to temp files
        with open('/tmp/team_ids.tmp', 'a') as f:
            f.write('$TEAM_ID\n')
        with open('/tmp/channel_ids.tmp', 'a') as f:
            f.write(channel_id + '\n')
        with open('/tmp/team_names.tmp', 'a') as f:
            f.write('$TEAM_NAME\n')
        with open('/tmp/channel_names.tmp', 'a') as f:
            f.write(channel_name + '\n')
except:
    pass
PYTHON_SCRIPT3
        
    done < /tmp/team_ids_list.tmp
    
    # Display all channels
    echo ""
    if [ -f /tmp/channel_ids.tmp ] && [ -s /tmp/channel_ids.tmp ]; then
        mapfile -t TEAM_IDS < /tmp/team_ids.tmp
        mapfile -t CHANNEL_IDS < /tmp/channel_ids.tmp
        mapfile -t TEAM_NAMES < /tmp/team_names.tmp
        mapfile -t CHANNEL_NAMES < /tmp/channel_names.tmp
        
        local TOTAL_CHANNELS=${#CHANNEL_IDS[@]}
        echo -e "${GREEN}✓ Found $TOTAL_CHANNELS channel(s)${NC}\n"
        
        for i in "${!CHANNEL_IDS[@]}"; do
            local NUM=$((i + 1))
            echo -e "${GREEN}${NUM}.${NC} ${BOLD}${TEAM_NAMES[$i]} > ${CHANNEL_NAMES[$i]}${NC}"
            echo -e "   ${CYAN}Team ID:${NC} ${TEAM_IDS[$i]}"
            echo -e "   ${CYAN}Channel ID:${NC} ${CHANNEL_IDS[$i]}"
            echo ""
        done
    else
        echo -e "${YELLOW}No channels found${NC}\n"
    fi
}

# Function to update .env file
update_env_file() {
    local CHAT_ID=$1
    
    # Update or add TEAMS_CHAT_ID in .env
    if grep -q "^TEAMS_CHAT_ID=" .env; then
        # Update existing line
        sed -i "s|^TEAMS_CHAT_ID=.*|TEAMS_CHAT_ID=$CHAT_ID|" .env
    else
        # Add new line
        echo "TEAMS_CHAT_ID=$CHAT_ID" >> .env
    fi
    
    echo -e "${GREEN}✓ Updated .env with TEAMS_CHAT_ID${NC}"
}

# Function to update .env file with team and channel IDs
update_env_file_channel() {
    local TEAM_ID=$1
    local CHANNEL_ID=$2
    
    # Comment out TEAMS_CHAT_ID if it exists
    if grep -q "^TEAMS_CHAT_ID=" .env; then
        sed -i "s|^TEAMS_CHAT_ID=|# TEAMS_CHAT_ID=|" .env
    fi
    
    # Update or add TEAMS_TEAM_ID
    if grep -q "^TEAMS_TEAM_ID=" .env; then
        sed -i "s|^TEAMS_TEAM_ID=.*|TEAMS_TEAM_ID=$TEAM_ID|" .env
    elif grep -q "^# TEAMS_TEAM_ID=" .env; then
        sed -i "s|^# TEAMS_TEAM_ID=.*|TEAMS_TEAM_ID=$TEAM_ID|" .env
    else
        echo "TEAMS_TEAM_ID=$TEAM_ID" >> .env
    fi
    
    # Update or add TEAMS_CHANNEL_ID
    if grep -q "^TEAMS_CHANNEL_ID=" .env; then
        sed -i "s|^TEAMS_CHANNEL_ID=.*|TEAMS_CHANNEL_ID=$CHANNEL_ID|" .env
    elif grep -q "^# TEAMS_CHANNEL_ID=" .env; then
        sed -i "s|^# TEAMS_CHANNEL_ID=.*|TEAMS_CHANNEL_ID=$CHANNEL_ID|" .env
    else
        echo "TEAMS_CHANNEL_ID=$CHANNEL_ID" >> .env
    fi
    
    echo -e "${GREEN}✓ Updated .env with TEAMS_TEAM_ID and TEAMS_CHANNEL_ID${NC}"
}

# Main menu
show_menu() {
    echo -e "${BLUE}${BOLD}"
    echo "╔════════════════════════════════════════╗"
    echo "║   Teams Chat ID Finder                 ║"
    echo "╚════════════════════════════════════════╝"
    echo -e "${NC}"
    echo -e "${BOLD}Please select an option:${NC}"
    echo ""
    echo -e "${GREEN}1.${NC} Find Chat IDs (1:1 and group chats)"
    echo -e "${GREEN}2.${NC} Find Channel IDs (team channels)"
    echo -e "${RED}3.${NC} Exit"
    echo ""
    echo -n "Enter your choice [1-3]: "
}

# Main script
main() {
    # Clean up temp files
    rm -f /tmp/chat_ids.tmp /tmp/chat_count.tmp /tmp/team_ids.tmp /tmp/channel_ids.tmp \
          /tmp/chat_types.tmp /tmp/chat_topics.tmp /tmp/chats_response.tmp \
          /tmp/members_response.tmp /tmp/teams_response.tmp /tmp/team_ids_list.tmp \
          /tmp/team_response.tmp /tmp/channels_response.tmp /tmp/team_names.tmp /tmp/channel_names.tmp
    
    # Show menu
    show_menu
    read -r CHOICE
    
    case $CHOICE in
        1)
            echo ""
            # Get access token
            ACCESS_TOKEN=$(get_access_token)
            
            if [ -z "$ACCESS_TOKEN" ]; then
                echo -e "${RED}Failed to acquire access token${NC}"
                exit 1
            fi
            
            # Fetch chats
            fetch_chats "$ACCESS_TOKEN"
            
            # Read the count from temp file
            if [ ! -f /tmp/chat_count.tmp ]; then
                echo -e "${YELLOW}No chats found${NC}"
                exit 0
            fi
            
            CHAT_COUNT=$(cat /tmp/chat_count.tmp)
            
            if [ "$CHAT_COUNT" -eq 0 ]; then
                echo -e "${YELLOW}No chats found${NC}"
                exit 0
            fi
            
            # Read chat IDs into array
            mapfile -t CHAT_IDS < /tmp/chat_ids.tmp
            
            # Ask user to select
            echo -e "${BOLD}Enter the number of the chat you want to export:${NC} "
            read -r SELECTION
            
            if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt "$CHAT_COUNT" ]; then
                echo -e "${RED}Invalid selection. Please enter a number between 1 and $CHAT_COUNT${NC}"
                exit 1
            fi
            
            # Get the selected chat ID (array is 0-indexed, but display is 1-indexed)
            SELECTED_CHAT_ID="${CHAT_IDS[$((SELECTION-1))]}"
            
            echo -e "\n${GREEN}✓ Selected chat #$SELECTION${NC}"
            echo -e "${CYAN}Chat ID:${NC} $SELECTED_CHAT_ID"
            
            # Update .env file
            echo -e "\n${CYAN}Updating .env file...${NC}"
            update_env_file "$SELECTED_CHAT_ID"
            
            # Run npm start generate
            echo -e "\n${CYAN}${BOLD}Starting chat export...${NC}\n"
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
            npm start generate
            ;;
        2)
            echo ""
            # Get access token
            ACCESS_TOKEN=$(get_access_token)
            
            if [ -z "$ACCESS_TOKEN" ]; then
                echo -e "${RED}Failed to acquire access token${NC}"
                exit 1
            fi
            
            # Fetch channels
            fetch_channels "$ACCESS_TOKEN"
            
            # Check if we have channels
            if [ ! -f /tmp/team_ids.tmp ] || [ ! -f /tmp/channel_ids.tmp ]; then
                echo -e "${YELLOW}No channels found${NC}"
                exit 0
            fi
            
            # Read into arrays
            mapfile -t TEAM_IDS < /tmp/team_ids.tmp
            mapfile -t CHANNEL_IDS < /tmp/channel_ids.tmp
            
            CHANNEL_COUNT=${#TEAM_IDS[@]}
            
            if [ "$CHANNEL_COUNT" -eq 0 ]; then
                echo -e "${YELLOW}No channels found${NC}"
                exit 0
            fi
            
            # Ask user to select
            echo -e "${BOLD}Enter the number of the channel you want to export:${NC} "
            read -r SELECTION
            
            if ! [[ "$SELECTION" =~ ^[0-9]+$ ]] || [ "$SELECTION" -lt 1 ] || [ "$SELECTION" -gt "$CHANNEL_COUNT" ]; then
                echo -e "${RED}Invalid selection. Please enter a number between 1 and $CHANNEL_COUNT${NC}"
                exit 1
            fi
            
            # Get the selected IDs
            SELECTED_TEAM_ID="${TEAM_IDS[$((SELECTION-1))]}"
            SELECTED_CHANNEL_ID="${CHANNEL_IDS[$((SELECTION-1))]}"
            
            echo -e "\n${GREEN}✓ Selected channel #$SELECTION${NC}"
            echo -e "${CYAN}Team ID:${NC} $SELECTED_TEAM_ID"
            echo -e "${CYAN}Channel ID:${NC} $SELECTED_CHANNEL_ID"
            
            # Update .env file
            echo -e "\n${CYAN}Updating .env file...${NC}"
            update_env_file_channel "$SELECTED_TEAM_ID" "$SELECTED_CHANNEL_ID"
            
            # Run npm start generate
            echo -e "\n${CYAN}${BOLD}Starting channel export...${NC}\n"
            echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}\n"
            npm start generate
            ;;
        3)
            echo -e "\n${YELLOW}Exiting...${NC}\n"
            exit 0
            ;;
        *)
            echo -e "\n${RED}Invalid choice. Please select 1, 2, or 3.${NC}\n"
            exit 1
            ;;
    esac
    
    # Clean up temp files
    rm -f /tmp/chat_ids.tmp /tmp/chat_count.tmp /tmp/team_ids.tmp /tmp/channel_ids.tmp \
          /tmp/chat_types.tmp /tmp/chat_topics.tmp /tmp/chats_response.tmp \
          /tmp/members_response.tmp /tmp/teams_response.tmp /tmp/team_ids_list.tmp \
          /tmp/team_response.tmp /tmp/channels_response.tmp /tmp/team_names.tmp /tmp/channel_names.tmp
}

# Run main function
main
