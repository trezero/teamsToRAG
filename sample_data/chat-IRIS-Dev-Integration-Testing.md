# Teams Chat Export for RAG

**Topic:** IRIS Dev Integration Testing
**Chat Type:** meeting
**Source:** Chat (19:meeti...)
**Total Messages:** 1882
**Created:** 6/24/2025, 9:52:38 AM
**Last Run:** 2025-11-10T04:46:19.640Z
**Last Run (Local):** 11/9/2025, 8:46:19 PM

---

## 6/24/2025

**Unknown User** - 10:06:56 AM



## 6/30/2025

**Unknown User** - 6:00:06 AM


**Unknown User** - 6:00:14 AM


**Jez Tucker** - 6:11:14 AM
fsuuid:inode:inodegen


 


-> encode -> md5sum "like"


 



keep as is md5sum likeprefix nghub-md5sumjust verbatim

**Gareth Tucker** - 6:14:10 AM
Apologies, need to speak to RAC man, brb

**Unknown User** - 6:30:49 AM


**Unknown User** - 6:30:50 AM


**Unknown User** - 6:31:25 AM



## 7/1/2025

**Orlando Richards** - 5:01:51 AM
Here's the final payload style for the inode etag numbers: 


 


 



 


        {
            "Key": "folder1/helloworld.txt",
            "LastModified": "2025-05-30T14:46:04+00:00",
            "ETag": ":3156238734335410383:144897:1300259225",
            "ChecksumAlgorithm": [
                ""
            ],
            "Size": 76,
            "StorageClass": "UNMANAGED"
        },
        {
            "Key": "helloworld.txt",
            "LastModified": "2025-05-30T14:45:49+00:00",
            "ETag": ":3156238734335410383:131072:568619437",
            "ChecksumAlgorithm": [
                ""
            ],
            "Size": 76,
            "StorageClass": "MIGRATED"
        },
 


That represents:


 


 






 


fsid 3156238734335410383, ino 131072, igen 568619437

**Orlando Richards** - 5:03:06 AM
That format is what we also use for the ngrecall command, so should ideally be preserved in that format to make it easy to consume "later" should it be needed

**Daniel Iwan** - 5:13:17 AM
great, I'm guessing the same will be used in the published events?

**Orlando Richards** - 5:27:56 AM
Christopher Oates- is that correct?

**Jez Tucker** - 5:31:32 AM
yep

**Jez Tucker** - 5:31:39 AM
everything will match
*Reactions: 👍*


## 7/2/2025

**Orlando Richards** - 1:29:11 AM
6.10.0-0.alpha.9 - contains Hub 2.8.0-0.alpha1 and Versity with the inode etag

 


USE_TEST_BUILDS=true pixstor-upgrade 6.10.0-0.alpha.9
reboot
pixstor apply
 
Daniel Iwan - could you push that out to the Cardiff lab nodes ahead of this afternoon's session?

**Daniel Iwan** - 1:31:39 AM
will do, thanks

**Jez Tucker** - 2:02:01 AM
Christopher Oates  presume Daniel will need some advice as to setting for the rabbit exchanges in Hub.  Can you provide details so it is working this morning?

**Daniel Iwan** - 3:01:10 AM
I suspect it auto-creates everything but we may need to create credentials for Chris

*Attachments:*
- messageReference

**Daniel Iwan** - 3:01:32 AM
It worked on server 1 but failed on 02






 


----------
          ID: /etc/arcapix/ngenea.conf
    Function: file.managed
      Result: False
     Comment: Unable to manage file: Jinja variable 'dict object' has no attribute 'StorageType'; line 26
              
              ---
              [...]
              {%- endfor %}
              {%- endif %}
              {% for target,settings in salt['pixpillar.get']('ngeneahsm_targets',{}).items() %}
              {%- if settings.get('enabled', True) %}
              [Storage {{ target }}]
              StorageType={{ settings['StorageType'] }}    <======================
              ConfigFile={{ settings.get('ConfigFile', '/opt/arcapix/etc/ngeneahsm/ngeneahsm_' + target + '.conf') }}
              RemoteLocationXAttrRegex={{ settings.get('RemoteLocationXAttrRegex', target + ':(.+)') }}
              {%- if settings.get('default_target') %}
              LocalFileRegex={{ salt['pixpillar.get']('gpfs:primaryfsmountpoint','/mmfs1') }}/(.+)
              {%- else %}
              [...]
              ---
     Changes:   
----------
          ID: ngeneahsm config for myspacetest-1-my_bucket_name
    Function: file.managed
        Name: /opt/arcapix/etc/ngeneahsm/ngeneahsm_myspacetest-1-my_bucket_name.conf
      Result: False
     Comment: Unable to manage file: Jinja variable 'dict object' has no attribute 'StorageType'; line 36
              
              ---
              [...]
                          'enabled',
                          ] %}
              [General]
              {#- Some things we usually want to be default and not specified explicitly - but allow overrides #}
              RemoteLocationXAttr={{ salt['pixpillar.get']('ngeneahsm_targets:'+target + ':RemoteLocationXAttr', target + ':$1') }}
              {%- if config['StorageType'] == 'FS' %}    <======================
              {%- do managed_settings.append('RetrieveObjectBasePath') %}
              {%- do managed_settings.append('StoreObjectBasePath') %}
              {%- do managed_settings.append('EnsureMountPoint') %}
              {# Filesystem targets have an additional pixstor paramater "MigrationTargetFolder",
                 which we use as a convenience tool to specify the path. #}
              [...]
              ---
     Changes:   
----------
          ID: ngeneahsm config for myspacestest2-my_bucket_name
    Function: file.managed
        Name: /opt/arcapix/etc/ngeneahsm/ngeneahsm_myspacestest2-my_bucket_name.conf
      Result: False
     Comment: Unable to manage file: Jinja variable 'dict object' has no attribute 'StorageType'; line 36
              
              ---
              [...]
                          'enabled',
                          ] %}
              [General]
              {#- Some things we usually want to be default and not specified explicitly - but allow overrides #}
              RemoteLocationXAttr={{ salt['pixpillar.get']('ngeneahsm_targets:'+target + ':RemoteLocationXAttr', target + ':$1') }}
              {%- if config['StorageType'] == 'FS' %}    <======================
              {%- do managed_settings.append('RetrieveObjectBasePath') %}
              {%- do managed_settings.append('StoreObjectBasePath') %}
              {%- do managed_settings.append('EnsureMountPoint') %}
              {# Filesystem targets have an additional pixstor paramater "MigrationTargetFolder",
                 which we use as a convenience tool to specify the path. #}
              [...]
              ---
     Changes:   
----------
          ID: versity1 versitygw root folder /var/lib/pixstor/versitygw/versity1
    Function: file.directory
        Name: /var/lib/pixstor/versitygw/versity1
      Result: False
     Comment: No directory to create /var/lib/pixstor/versitygw/versity1 in
     Changes:   
              ----------
              /var/lib/pixstor/versitygw/versity1:
                  ----------
                  directory:
                      new
----------
          ID: Install versitygw configuration file for versity1 endpoint
    Function: file.managed
        Name: /etc/versitygw.d/versity1.conf
      Result: True
     Comment: File /etc/versitygw.d/versity1.conf updated
     Changes:   
              ----------
              diff:
                  New file
----------
          ID: versitygw systemd service for versity1
    Function: service.running
        Name: versitygw@versity1
      Result: False
     Comment: One or more requisite failed: versitygw.configure.versity1 versitygw root folder /var/lib/pixstor/versitygw/versity1
     Changes:   
----------

*Attachments:*
- messageReference

**Barry Evans** - 3:32:17 AM
I have some questions

**Barry Evans** - 3:32:23 AM
do I use this channel

**Gareth Tucker** - 3:35:11 AM
This is the channel that has the new recurring meeting associated with it

**Gareth Tucker** - 3:35:47 AM
the other one with confusingly the same name was for the initial one off meeting

**Jez Tucker** - 4:01:37 AM
in other teams like fun.  Does anyone else actually have a Reply button as per https://support.microsoft.com/en-gb/office/reply-to-a-specific-message-in-chat-in-microsoft-teams-940c614c-4f07-41d4-850b-90f11da8329b#id0ebbd=desktop  or is it just me that's missing it cos Teams + Linux.


There MUST be a slack to teams gateway somewhere.

**Jez Tucker** - 4:04:33 AM
6 - Use Conclude.io to connect Slack and Microsoft Teams
Using Conclude Link, you can sync channels within your organization. This enables cross-platform messages.


For example, when half your business uses Microsoft Teams and the other half uses Slack, you can connect the platforms in the background and let your users continue using their preferred platform.


No longer do they have to switch between apps to cater to colleagues who use a different platform. 


Additionally, Conclude Workflows allows you to connect Jira and AI integrations within Slack.


 


I'm buying shares in Conclude.io

**Barry Evans** - 4:05:08 AM
i gots a button

*Attachments:*
- messageReference

**Jez Tucker** - 4:05:23 AM
I can send a letter via royal mail

**Jez Tucker** - 4:06:16 AM
Daniel Iwan since I cannot reply without quoting the entire original message.... how did you setup the buckets on node 2 that are failing? Hub or salt ?

**Daniel Iwan** - 4:18:59 AM
not sure tbh how it was set up but they look similar on 01 and 02, 


On 02 we have

*Attachments:*
- Screenshot 2025-07-02 at 12.17.37.png

**Daniel Iwan** - 4:21:39 AM
looks like some dead symbolic link


 



 


ls -la  /var/lib/pixstor/versitygw/versity1/versity_ngenea_backend_bucket 
lrwxrwxrwx 1 root root 36 Jul  2 10:52 /var/lib/pixstor/versitygw/versity1/versity_ngenea_backend_bucket -> /mmfs1/versity_ngenea_backend_bucket
 


that /mmfs1/versity_ngenea_backend_bucket does not exist

**Daniel Iwan** - 4:26:28 AM
ls -la /mmfs1/
total 553
drwxr-xr-x   8 root root 262144 May 30 16:27 .
drwxr-xr-x   1 root root   4096 Jul  2 10:30 ..
drwxr-xr-x   7 root root    512 May 30 16:27 apsearch
drwxrwxr-x+ 11 root root   8192 May 30 16:44 .arcapix
drwxr-xr-x   2 root root    512 May 30 16:44 .ctdb
drwxr-xr-x   3 root root    512 Jun  9 12:01 data
drwxrwx---+ 35 root root   8192 Jul  2 00:12 .policytmp
drwxrwx---+  2 root root    512 May 30 21:12 .rotate
dr-xr-xr-x   2 root root   8192 Jan  1  1970 .snapshots
ls -la /mmfs1/data/
total 514
drwxr-xr-x 3 root root    512 Jun  9 12:01 .
drwxr-xr-x 8 root root 262144 May 30 16:27 ..
drwxrwxrwx 4 root root    512 Jun  9 12:45 space01
 


but on 01


 



 


ls -la /mmfs1/
total 555
drwxr-xr-x  10 root root 262144 Jun 20 16:09 .
drwxr-xr-x   1 root root   4096 Jul  2 10:00 ..
drwxr-xr-x   7 root root    512 May 30 12:14 apsearch
drwxrwxr-x+ 11 root root   8192 May 30 12:21 .arcapix
drwxr-xr-x   2 root root    512 May 30 12:22 .ctdb
drwxr-xr-x   9 root root    512 Jul  2 10:28 data
drwxr-xr-x   3 root root    512 Jun 20 16:09 .ngenea
drwxrwx---+ 35 root root   8192 Jul  2 00:12 .policytmp
drwxrwx---+  2 root root    512 May 30 21:12 .rotate
dr-xr-xr-x   3 root root   8192 Jun  6 15:33 .snapshots
drwx------   5 root root    512 Jun 23 15:03 versity_ngenea_backend_bucket
ls -la /mmfs1/data/
total 535
drwxr-xr-x  9 root root    512 Jul  2 10:28 .
drwxr-xr-x 10 root root 262144 Jun 20 16:09 ..
drwxrwxrwx  2 root root    512 Jul  2 10:28 curlspacestest2
drwxrwxrwx  2 root root    512 Jul  2 10:19 ngeneabucketmanagerstoragetest-info
drwxrwxrwx  2 root root    512 Jul  2 10:27 ngeneabucketmanagerstoragetest-list
drwxrwxrwx  2 root root    512 Jul  2 10:22 non-empty-for-deletion
drwxrwxrwx  4 root root   8192 Jun 24 11:47 space01
drwxrwxrwx  4 root root    512 Jun 30 14:03 test-space
drwxrwxrwx  2 root root    512 Jun 23 14:51 test-space-no-iris
ls -la /mmfs1/versity_ngenea_backend_bucket/
total 517
drwx------  5 root root    512 Jun 23 15:03 .
drwxr-xr-x 10 root root 262144 Jun 20 16:09 ..
d---------  2 root root    512 Jun 20 16:09 .sgwtmp
dr-xr-xr-x  3 root root   8192 Jun  6 15:33 .snapshots
d---------  2 root root    512 Jun 20 16:09 space01
d---------  2 root root    512 Jun 23 15:06 test-space

**Orlando Richards** - 5:56:31 AM
wow - that cost almost twice as much as slack does per user!

*Attachments:*
- messageReference

**Jez Tucker** - 5:57:12 AM
cheaper to keep slack

**Unknown User** - 6:00:32 AM


**Unknown User** - 6:00:40 AM


**Daniel Iwan** - 6:33:50 AM
path for /var/lib/pixstor/iris/mcs-runtime/ca/tls/ca.crt

**Daniel Iwan** - 6:45:21 AM
pixstor-fs-events-xchg


vision-metadata-xchg

**Unknown User** - 7:00:01 AM


**Unknown User** - 7:00:01 AM


**Unknown User** - 7:02:41 AM


**Jez Tucker** - 7:06:08 AM
Daniel Iwan these are my quick notes from the meeting.  Can you quickly review?


Notes from integration meeting:

 



Daniel will resolve rabbitmq exposure/ssl issueNeed to split mediainfo and file_notify into separate exchanges

maintain in same rabbitmq.yaml  (mediainfo:vision-metadata-xchg   file_notify:pixstor-fs-events-xchg)
rabbitmq client to auto create exchangesmediainfo s3/host to change to endpoint-url

details manually taken from pixstor config get iris:vision:server_address  http[s]://ip:port

**Jez Tucker** - 7:08:13 AM
+ I need to sort out server 02

**Daniel Iwan** - 7:10:52 AM
that covers it I think.


Reg.1 we may not need to change anything as ports are exposed on localhost

**Jez Tucker** - 7:27:26 AM
Daniel Iwan / team to regenerate mq messages from pixstor right now, navigate to https://ca-sn-dev-01/job/535?view=tasks  and click the "Resubmit Job" button after doing some data operations under /mmfs1/data/space01/

**Orlando Richards** - 9:31:00 AM
6.10.0-0.alpha.10
 


building now with version 0.10.1 of Vision baked into it


 


Cardiff won't need to upgrade to that - the only difference from alpha.9 is the changes to the installer. 


 


Ngenea/AI+ devs who need a Vision should update to that, wipe their vision, and reinstall.


## 7/3/2025

**Daniel Iwan** - 5:41:47 AM
Jez Tucker we have timeout failures on re-submitted jobs


any way to diagnose that further?






 


{
  "url": "https://ca-sn-dev-01.om.cardifflab/api/tasks/95/",
  "id": 95,
  "task_id": "2a991ff0-f2a3-45f9-8bc3-988026596c28",
  "tasktype": "dynamo.tasks.vision.mediainfo",
  "state": "FAILURE",
  "started": "2025-07-03T12:38:45.563379Z",
  "completed": "2025-07-03T12:39:06.796611Z",
  "runtime": 21.233232,
  "job": 607,
  "site": "ca-sn01",
  "paths": "https://ca-sn-dev-01.om.cardifflab/api/tasks/95/files/",
  "parents": [],
  "dynamic_parents": [],
  "result": {
    "error": "TimeoutError: Job timed out"
  },
  "friendly_name": null
}

*Attachments:*
- Screenshot 2025-07-03 at 13.39.20.png

**Jez Tucker** - 6:07:31 AM
I'll go have a look.  Got to fix up that 2nd node too.


How many files are in the job?

**Daniel Iwan** - 6:09:16 AM
it was failing only with 1 file touched

**Jez Tucker** - 6:09:37 AM
I'll call in a few
*Reactions: 👍*

**Jez Tucker** - 6:17:46 AM
something appears "unwell" with the node

**Daniel Iwan** - 6:21:42 AM
in what sense?


## 7/7/2025

**Daniel Iwan** - 1:10:56 AM
Hi Jez Tucker


We did the upgrade to build 12 on Fri and here are our observations



both mediainfo and filenotify are using the same exchange vision-metadata-xchg, filenotify should be on pixstor-fs-events-xchgthey are trying to setup the exchange with flag durable false, instead of true. I updated the online spec to make that part clearer
Below is the output of the tasks


 



 


{
  "url": "https://ca-sn-dev-01.om.cardifflab/api/tasks/127/",
  "id": 127,
  "task_id": "2d54603b-09fb-40bb-94d0-0f912dae0151",
  "tasktype": "dynamo.tasks.vision.mediainfo",
  "state": "FAILURE",
  "started": "2025-07-04T17:40:11.536714Z",
  "completed": "2025-07-04T17:40:13.547885Z",
  "runtime": 2.011171,
  "job": 669,
  "site": "ca-sn01",
  "paths": "https://ca-sn-dev-01.om.cardifflab/api/tasks/127/files/",
  "parents": [],
  "dynamic_parents": [],
  "result": {
    "error": "ChannelClosedByBroker: (406, \"PRECONDITION_FAILED - inequivalent arg 'durable' for exchange 'vision-metadata-xchg' in vhost '/': received 'false' but current is 'true'\")"
  },
  "friendly_name": null
}

{
  "url": "https://ca-sn-dev-01.om.cardifflab/api/tasks/126/",
  "id": 126,
  "task_id": "44029046-ccd5-4296-9599-37a78ae5c63c",
  "tasktype": "dynamo.tasks.vision.filenotify",
  "state": "FAILURE",
  "started": "2025-07-04T17:40:11.536714Z",
  "completed": "2025-07-04T17:40:11.462374Z",
  "runtime": 0,
  "job": 669,
  "site": "ca-sn01",
  "paths": "https://ca-sn-dev-01.om.cardifflab/api/tasks/126/files/",
  "parents": [],
  "dynamic_parents": [],
  "result": {
    "error": "ChannelClosedByBroker: (406, \"PRECONDITION_FAILED - inequivalent arg 'durable' for exchange 'vision-metadata-xchg' in vhost '/': received 'false' but current is 'true'\")"
  },
  "friendly_name": null
}
let us know if you need any more details

**Jez Tucker** - 1:50:13 AM
suspect we have not changed the rabbitmq.conf file post upgrade 


I will have a look this am
*Reactions: 👍*

**Jez Tucker** - 2:40:20 AM
Daniel Iwan  "pre-integ testing"  is raising pika.exceptions.ChannelClosedByBroker: (406, "PRECONDITION_FAILED - inequivalent arg 'durable' for exchange 'pixstor-fs-events-xchg' in vhost '/': received 'false' but current is 'true'")

 


I think we could do with a little huddle we seem out of alignment spec wise

**Daniel Iwan** - 2:42:33 AM
sure, no worries

**Jez Tucker** - 2:43:31 AM
when's good? now?

**Daniel Iwan** - 2:43:45 AM
yeah, we can do it now no probs

**Jez Tucker** - 2:43:51 AM
cool. I'll grab a Chris.

**Jez Tucker** - 4:10:07 AM
Daniel Iwan looking better. give it a poke

**Daniel Iwan** - 4:13:31 AM
excellent, will give it a try now

**Daniel Iwan** - 4:19:40 AM
yes, that looks better. Small issue regarding directories though. I think the s3 key does not end with /

**Jez Tucker** - 4:32:24 AM
ok. let's discuss that one on integration call.
*Reactions: 👍*

**Daniel Iwan** - 4:40:49 AM
Also versitygw should report them as directories application/x-directory rather than binaries


 


S3 request


 



 


aws s3api head-object --no-verify-ssl --endpoint-url https://localhost:7070  --bucket space01 --key "dirA/"
{
    "AcceptRanges": "bytes",
    "Restore": "",
    "LastModified": "Fri, 04 Jul 2025 18:30:09 GMT",
    "ContentLength": 512,
    "ETag": ":10848671671403863553:278529:435805880",
    "ContentType": "binary/octet-stream",
    "Metadata": {
        "apxaclxx": "nfs4:nfs4:{A::OWNER@:acCDnNortTwxy,A::GROUP@:cnrtxy,A::EVERYONE@:cnrtxy}",
        "apxmtime": "2025-07-04 19:30:09.126305000+01:00",
        "apxgroup": "root/0",
        "etag": ":10848671671403863553:278529:435805880",
        "apxguuid": "19f9deb8-0ade-de01-0000-000000044001",
        "apxctime": "2025-07-04 19:30:09.126305000+01:00",
        "apxatime": "2025-07-07 12:24:37.060044578+01:00",
        "apxfmode": "0040755",
        "apxowner": "root/0"
    },
    "StorageClass": "UNKNOWN"
}
This may coming from how GPFS reports the size (includes data structure size)


 



 


ls -la
total 1086614
drwxrwxrwx 5 root root      8192 Jul  4 19:32  .
drwxr-xr-x 8 root root       512 Jul  2 13:44  ..
-rw-r--r-- 1 root root     30988 Jun  6 16:19  cats-54-offline.jpg
drwxr-xr-x 2 root root       512 Jul  4 19:30  dirA
-rw-r--r-- 1 root root   2504642 Jul  7 12:23  file_example_JPG_2500kB.jpg
-rw-r--r-- 1 root root        62 Jul  2 14:39  helloworld.1
-rw-r--r-- 1 root root        72 Jun  6 15:35  helloworld.txt
-rw-r--r-- 1 root root        34 Jun  6 16:28  list.txt
-rw-r--r-- 1 root root 257352602 Jul  4 13:07  output.mov
d--------- 3 root root       512 Jul  4 10:39 'Parent Test'
-rw-r--r-- 1 root root 111058192 Jul  3 10:02  part1.mov
-rw-r--r-- 1 root root 146289231 Jul  4 18:39  part2.mov
-rw-r--r-- 1 root root 594695671 Jun  6 16:26 'Screen Recording 2025-06-06 at 16.11.58.mov'
-rw-r--r-- 1 root root     17276 Jun 24 11:47 'Screenshot 2025-06-24 111212Screenshot 2025-06-24 111212Screenshot 2025-06-24 111212Screenshot 2025-06-24 111212.png'
drwxr-xr-x 3 root root       512 Jun  6 16:07  .sgwtmp
dr-xr-xr-x 3 root root      8192 Jul  7 12:24  .snapshots

**Unknown User** - 6:00:42 AM


**Unknown User** - 6:00:50 AM


**David Bridger** - 6:08:47 AM
brb

**Daniel Iwan** - 6:56:52 AM
FileDelete+FileCreated as a result of file moved from dirA/list.txt to ./list-named.txt


This was instead of a single FileMoved event


Events published below.


 



 


{"eventTime": "2025-07-07T12:31:04.885Z", "eventName": "FileDeleted", "tenantId": "iris", "source": {"fsInode": {"fsid": "10848671671403863553", "ino": "262149", "igen": "425729206"}, "s3object": {"endpointUrl": "https://ca-sn-dev-01.om.cardifflab:7070", "bucket": "space01", "key": "dirA/list.txt", "etag": ":10848671671403863553:262149:425729206"}}}
then


 



 


{"eventTime": "2025-07-07T12:31:15.083Z", "eventName": "FileCreated", "tenantId": "iris", "source": {"fsInode": {"fsid": "10848671671403863553", "ino": "262149", "igen": "425729207"}, "s3object": {"endpointUrl": "https://ca-sn-dev-01.om.cardifflab:7070", "bucket": "space01", "key": "list-renamed.txt", "etag": ":10848671671403863553:262149:425729207"}}}
 


with 2nd event being with new fs inode generation

**Unknown User** - 7:29:32 AM


**Unknown User** - 7:29:34 AM


**Unknown User** - 7:32:46 AM


**Jez Tucker** - 9:13:44 AM
Daniel Iwan  you should now have directory paths with / on the end

**Daniel Iwan** - 9:14:08 AM
awesome, thanks

**Daniel Iwan** - 9:17:40 AM
works great

**Jez Tucker** - 9:27:51 AM
cool. on another positive note Gareth Tucker I have found the salt code which is supposed to make that pre-existing bucket directory on the system after space creation.  it looks sound at first glance, going to kick it a few times to see what falls out

**Gareth Tucker** - 9:57:43 AM
Cool, thanks Jez Tucker hopefully an obvious explanation on that one


## 7/8/2025

**Daniel Iwan** - 2:45:13 AM
Hi Jez Tucker we've set up a schedule every 5 mins on our dev 01 and we get mixed result on the Job list.


Details of the job error are






 


{
  "url": "https://ca-sn-dev-01.om.cardifflab/api/tasks/265/",
  "id": 265,
  "task_id": "194ac3d8-64b1-4070-bc49-e5d175e7f1a3",
  "tasktype": "dynamo.tasks.vision.filenotify",
  "state": "ERROR",
  "started": "2025-07-08T09:40:18.832296Z",
  "completed": "2025-07-08T09:40:20.577849Z",
  "runtime": 1.745553,
  "job": 711,
  "site": "ca-sn01",
  "paths": "https://ca-sn-dev-01.om.cardifflab/api/tasks/265/files/",
  "parents": [],
  "dynamic_parents": [],
  "result": {
    "log": [],
    "skip": false,
    "jobid": 711,
    "paths": [],
    "queue": "ca-sn01#custom",
    "status": {
      "task": "dynamo.tasks.vision.filenotify",
      "details": {
        "aborted": [],
        "skipped": [],
        "failures": [
          {
            "path": "/mmfs1/data/space01/Screen Recording 2025-06-06 at 16.11.58.mov",
            "message": [
              "Missing field from path payload: 'additional_metadata'"
            ]
          },
          {
            "path": "/mmfs1/data/space01/output.mov",
            "message": [
              "Missing field from path payload: 'additional_metadata'"
            ]
          },
          {
            "path": "/mmfs1/data/space01/part2.mov",
            "message": [
              "Missing field from path payload: 'additional_metadata'"
            ]
          },
          {
            "path": "/mmfs1/data/space01/part1.mov",
            "message": [
              "Missing field from path payload: 'additional_metadata'"
            ]
          }
        ],
        "processed": [],
        "inprogress": []
      },
      "started": "2025-07-08T09:40:18.832296+00:00",
      "summary": {
        "aborted": 0,
        "skipped": 0,
        "failures": 4,
        "processed": 0,
        "inprogress": 0
      },
      "input_paths": [
        {
          "path": "/mmfs1/data/space01/Screen Recording 2025-06-06 at 16.11.58.mov",
          "size": 594695671,
          "type": "file",
          "state": "created"
        },
        {
          "path": "/mmfs1/data/space01/output.mov",
          "size": 257352602,
          "type": "file",
          "state": "created"
        },
        {
          "path": "/mmfs1/data/space01/part2.mov",
          "size": 146289231,
          "type": "file",
          "state": "created"
        },
        {
          "path": "/mmfs1/data/space01/part1.mov",
          "size": 111058192,
          "type": "file",
          "state": "created"
        }
      ],
      "input_total": 4
    },
    "chain_details": {
      "all_fail": [
        {
          "path": "/mmfs1/data/space01/Screen Recording 2025-06-06 at 16.11.58.mov",
          "message": [
            "Missing field from path payload: 'additional_metadata'"
          ]
        },
        {
          "path": "/mmfs1/data/space01/output.mov",
          "message": [
            "Missing field from path payload: 'additional_metadata'"
          ]
        },
        {
          "path": "/mmfs1/data/space01/part2.mov",
          "message": [
            "Missing field from path payload: 'additional_metadata'"
          ]
        },
        {
          "path": "/mmfs1/data/space01/part1.mov",
          "message": [
            "Missing field from path payload: 'additional_metadata'"
          ]
        }
      ],
      "all_skip": []
    }
  },
  "friendly_name": null
}

*Attachments:*
- Screenshot 2025-07-08 at 10.42.59.png

**Jez Tucker** - 5:04:12 AM
that is possibly correct atm


the first job is the snapdiff which then generates results to send to the vision notify


then that task observes


 



 


"failures": [
          {
            "path": "/mmfs1/data/space01/Screen Recording 2025-06-06 at 16.11.58.mov",
            "message": [
              "Missing field from path payload: 'additional_metadata'"
            ]
          },
 


I will have a look later today what the likely cause is.

**Daniel Iwan** - 5:07:48 AM
thanks Jez

**Christopher Oates** - 6:17:38 AM
you'll need to do






 


ngcurl patch schedules/1 '{"discovery_options": {"condense_moves": false, "extra_fields": ["inode", "generation"]}}'



(replace schedules/1 with whatever the correct schedule id is)

**Erik Salter** - 7:00:26 AM
Daniel Iwan Do you have a test node I can start posting metadata to from our system in FL?

**Daniel Iwan** - 7:24:57 AM
Thanks Chris, did that, looks like it's working

*Attachments:*
- messageReference

**Daniel Iwan** - 7:26:45 AM
we have our dev environment. I'll have a chat with Gareth and get back to you

*Attachments:*
- messageReference

**Jez Tucker** - 8:17:15 AM
Also; Daniel Iwan we found the gap regarding the versity bucket folder.


Right now, post space creation run: pixstor apply -s iris        after the job to create the space has successfully run to have salt create the folder.


We'll add a ticket to hook the two worlds together.
*Reactions: 👍*

**Gareth Tucker** - 8:52:13 AM
Erik Salter it is worth having a quick chat to review expectations on this one I think. The short answer would be the Pixstor that you have in your lab in FTL, I believe on lambda1, but in it's current state, this might not achieve what you are hoping for. Give us a shout when you have 5-10 mins and we'll jump on a call.

*Attachments:*
- messageReference

**Erik Salter** - 8:59:34 AM
Yeah, let's sync tomorrow morning, given the time differences.
*Reactions: 👍*

**Gareth Tucker** - 10:14:51 AM
Jez Tucker we'll need some help in the morning please re: MediaInfo. We don't seem to be getting any for jobs that are run on a schedule.


## 7/9/2025

**Jez Tucker** - 1:06:50 AM
Noted.  We'll wave post 10am

**Jez Tucker** - 1:07:04 AM
likely this is the patching, I'll grab a chris.

**Gareth Tucker** - 1:15:12 AM
Cheers Jez

**Jez Tucker** - 3:07:28 AM
^^ It's not the patching, it's the workflow.  We need a conversation about when you need those notifications.


In summary, for filenotify these are generated on file creation, updates, moved, deletions


mediainfo atm is only generated for file updates.  


 


following comms with Gareth just now, I'm going to tweak the workflow to send mediainfo also on file creation
*Reactions: 👍, 👍*

**Jez Tucker** - 3:31:01 AM
Allo. I believe this is now resolved.  Please let me know if you are not seeing any further registrations.

**Jez Tucker** - 3:31:22 AM
Also, new doc for your eyes just to help smooth the cracks meanwhile https://perifery.atlassian.net/wiki/spaces/MCS/pages/4343562246/Cardiff+Lab+Hub+Use+Guidance
*Reactions: 👍*

**Gareth Tucker** - 3:33:53 AM
Thanks Jez, we'll take a look

**Jez Tucker** - 3:35:30 AM
I will now remove all my jeztest spaces and see if I can boss node2 into shape

**Jez Tucker** - 3:37:00 AM
And for the QA's in the room, Cristina is starting to put coverage here https://perifery.atlassian.net/wiki/spaces/MCS/pages/4343496724/IRIS+R1+Manual+Testing


We'll need to augment it with wider E2E after.

**Cristina Pucci** - 3:37:44 AM
Yep, just having a play with the UI and gathering my thoughts, then will start writing down

**Gareth Tucker** - 5:09:20 AM
Hi Jez Tucker, FYI, we look to be getting MediaInfo for new files now in the QA space.


 


Did you disable the task schedule for space01?

*Attachments:*
- messageReference

**Jez Tucker** - 5:33:22 AM
ooh I did when testing. I'll enable it again

**Jez Tucker** - 5:33:50 AM
(done)
*Reactions: 👍*

**Jez Tucker** - 5:34:19 AM
now going to turn my attention to node #2

**Erik Salter** - 6:08:06 AM
Gareth Tucker Got some time now?

**Gareth Tucker** - 6:17:02 AM
Erik Salter sure, Daniel Iwan you about?

**Erik Salter** - 6:21:24 AM
https://teams.microsoft.com/l/meetup-join/19%3ameeting_YTU3MjMwZDAtNjQ2Zi00ZDkxLWE3YjctN2UzZjg2ZTZhNzU3%40thread.v2/0?context=%7b%22Tid%22%3a%227fdfb85b-a737-4b5e-b8db-82fae44d92c8%22%2c%22Oid%22%3a%22400a776a-e6d8-4bdd-9bc9-da45dcc0bf75%22%7d

**Gareth Tucker** - 7:00:21 AM
Erik Salter Jamie Sabino which of the 2 PixStor's that you have in FTL should we review the RabbitMQ config on so that Erik can do some integration tests? 10.161.244.101 or 10.161.244.102?

**Erik Salter** - 7:02:32 AM
Dealer's choice.  I don't know enough about the instances to comment.

**Gareth Tucker** - 7:04:51 AM
ok, if you have no preference we'll go with 10.161.244.101, they should be similar

**Jamie Sabino** - 7:14:51 AM
Gareth Tucker,  my understanding .101 is the 'master' which also hosts the front end vision (see https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4998135809/ftl-dev-sn-01+10.161.244.101) . Erik Salter should this be decoupled from their standard deployment ?  Should we create a separate vm within that network space?

**Jamie Sabino** - 7:16:09 AM
Jessica Harris ^ fyi..  i see we are 5 or so versions behind what i see noted in the UK lab, and we are slatted to upgrade this version with the r1 release..  I would assume the upgrade process may blow this away??

**Gareth Tucker** - 7:17:14 AM
I believe the upgrade will leave the Vision components alone

**Gareth Tucker** - 7:18:12 AM
and for what Erik needs short term, I don't think we need the latest PixStor at the moment. Thanks for the heads up tho Jessica Harris

**Jamie Sabino** - 7:18:15 AM
would rather deploy this in a manner we don't create a snowflake for deployment.

**Jessica Harris** - 7:33:49 AM
We could snapshot then upgrade to be certain?

**Gareth Tucker** - 8:09:06 AM
That sounds like a plan Jessica. We have been upgrading the Cardiff instances without any issue but it would be good to have a safety net.


 


As you mention, we may end up wiping these at some point, but it wouldn't hurt to keep them in sync. If it's OK Jessica Harris can we let you co-ordinate that with Jamie Sabino?


 


In the meantime, I think we are good to carry on as is with getting RabbitMQ configured on 10.161.244.101 so that Erik can do his integration testing as we don't rely on the PixStor upgrade for that. Please shout though if anybody see's a problem with this. Thanks.

**Jez Tucker** - 8:56:08 AM
Allo.


I have fixed up both cardiff nodes now.


They are up to date with software versions, workflows, yada yada.


 


One thing that is occurring on the second node (ca-sn-dev-02) is that the the services for mcs-mapi, mcs-nginx, mcs-vision are continually restarting as the docker images are missing.


 


If someone could point me / load them on that would be superb.

**Gareth Tucker** - 8:57:21 AM
Cool thanks Jez, we'll take a look as soon as we get a chance

**Daniel Iwan** - 9:06:53 AM
Erik Salter Rabbit should be accessible on 10.161.244.101 over standard 5671 with TLS.


CA cert for that server should be the one included. This is generated by internal vision stack CA, and not the one exposed by nginx, but it should be OK for your dev purposes


 


metadata exchange is there so you should be able to publish to it.


Let us know once you have so we can have a look at the messages

*Attachments:*
- ftl-01-ca-mcs.crt

**Jez Tucker** - 9:27:10 AM
I remember the first Sun Java Station at Uni, but I was defo a good decade or so older than this ... 


 



 


REPOSITORY                                                                         TAG                   IMAGE ID       CREATED         SIZE
832471001844.dkr.ecr.us-east-1.amazonaws.com/vision/mcs-vision-api                 0.0.42                cdd3610510ee   45 years ago    304MB
832471001844.dkr.ecr.us-east-1.amazonaws.com/vision/mcs-metadata-api               0.4.1                 3f6057b48254   45 years ago    297MB
832471001844.dkr.ecr.us-east-1.amazonaws.com/vision/mcs-vision-api                 0.0.41                9254761ee387   45 years ago    304MB
832471001844.dkr.ecr.us-east-1.amazonaws.com/vision/mcs-metadata-api               0.4.2                 1bc072837c58   45 years ago    297MB
*Reactions: 😆, 😆*


## 7/10/2025

**Jez Tucker** - 2:11:26 AM
Thanks for Daniel Iwan 's little pointer this morning, both cardiff nodes are now up to date, salt clean and all services running.
*Reactions: 👍*

**Jez Tucker** - 2:16:38 AM
I should also mention that we have determined a method to create read-only versity buckets with a different credential.  We should likely catch up about that OOB from the Thu call.
*Reactions: 👍*

**Jez Tucker** - 3:06:36 AM
Hey up folks.  I wonder if someone might be able to let us know how to get your admin creds for the keycloak dockers if we spin up identical nodes to this cardiff lab?  We have some movement on the hub and want to add a user to the vision realm for quick testing.

**Jez Tucker** - 3:07:20 AM
we also need to discuss the final keycloak setup.


feels like there should be an encompassing IRIS realm for all product?

**Barry Evans** - 3:07:59 AM
what do you mean "realm"

**Barry Evans** - 3:08:08 AM
like in keycloak?

**Jez Tucker** - 3:08:09 AM
keycloak 'realm'.

**Barry Evans** - 3:08:17 AM
now I feel stupid

**Jez Tucker** - 3:08:29 AM
it's been a learning experience for us too!

**Jez Tucker** - 3:09:10 AM
we /might/ have a poc for basic sso and need to test it against vision

**Jez Tucker** - 3:30:34 AM
aha.  by the powers of greyskull, I have found it.  plaintext in /var/log/vision_install.log
*Reactions: 😆*

**Gareth Tucker** - 3:42:20 AM
Identical as in cloned, or just 2 installs based on the same version?

*Attachments:*
- messageReference

**Jez Tucker** - 3:42:44 AM
we're going to build a new node internal dev only with same setup to live dev on

**Gareth Tucker** - 3:43:08 AM
ok, what you found is one way

**Gareth Tucker** - 3:43:53 AM
there should be another print out somewhere else on newer installs I think, Dan and I were on the hunt for the same last night on the US instances

**Gareth Tucker** - 3:44:20 AM
the info comes out on screen post install but should now be redirected to a file + what is in the install log

**Gareth Tucker** - 3:45:01 AM
Well done He-Man for finding it though

**Jez Tucker** - 3:45:29 AM
I always liked Man-At-Arms.
*Reactions: 😆*

**Gareth Tucker** - 3:46:19 AM
This was the other location, but it doesn't seem to have the full output at the moment

**Gareth Tucker** - 3:46:25 AM
/var/lib/pixstor/iris/mcs-runtime/output

**Jez Tucker** - 3:48:05 AM
kk.  I think we'll log some tickets to track this.  imho the creds should be in /root/versity_credentials.log, not in with the main logs so that they are separate and not logrotated (i.e searchable by Skeletor)


I can keep going with this He-Man premise for a while...
*Reactions: 😆*

**Jez Tucker** - 3:49:15 AM
Daniel Iwan I have just bumped the versity version.  Hopeful you now see directories as x-directory mime types

**Daniel Iwan** - 4:38:31 AM
thanks Jez Tucker


regarding Keycloak creds it should be in the /var/log/vision_install.log at the very bottom

**Cristina Pucci** - 5:42:27 AM
Is it possible to get access to Vision UI please, so I can make sure I add all the tests you need?

**Gareth Tucker** - 5:43:48 AM
Hi Cristina, hopefully you can see this page

**Gareth Tucker** - 5:43:51 AM
https://perifery.atlassian.net/wiki/spaces/MCS/pages/4297818165/Pixstor+dev+deployment+at+OM

**Gareth Tucker** - 5:44:13 AM
We are testing against PixStor Dev 01 at the moment

**Cristina Pucci** - 5:44:29 AM
Fantastic, thank you

**Gareth Tucker** - 5:44:30 AM
For convenience though, this is what you need


 


URL: https://ca-sn-dev-01.om.cardifflab:9505/


Username: admin-1071

Password: fFlM1EcJdY

**Cristina Pucci** - 5:46:38 AM
hmm do I need to be connected to your VPN? Or is the above node switched off? As I am getting "the site cannot be reached" atm

**Gareth Tucker** - 5:47:10 AM
Yes, was about to ask, do you have access to the Cardiff VPN?

**Cristina Pucci** - 5:47:31 AM
I don't, no..

**Jez Tucker** - 5:50:47 AM
let's sort that out...

**Cristina Pucci** - 5:54:23 AM
Jez and I just had a call

**Cristina Pucci** - 5:54:54 AM
We will get Alex or Jessica Harris to sort out access to the vpn for me

**Gareth Tucker** - 5:55:06 AM
So that's a DC IT to request, guessing others will need it too that don't already have it

**Gareth Tucker** - 5:55:28 AM
If you'd like to supply a list, I can put the request in

**Jez Tucker** - 5:55:41 AM
I think we are still in control of our own VPN setup at this time

**Jez Tucker** - 5:55:47 AM
*think

**Gareth Tucker** - 5:56:04 AM
you are yes, we are not any more unfortunately

**Jez Tucker** - 5:56:45 AM
I think we only need to do our side as it's via pritunl and we reach the UIs over SSH tunnel

**Gareth Tucker** - 5:57:08 AM
ah ok, is that how those who already have access are doing it on your side?

**Jez Tucker** - 5:57:15 AM
yep. that's my route

**Gareth Tucker** - 5:57:38 AM
makes sense, don't remember asking for anybody to have access to our VPN yet from your side

**Jez Tucker** - 5:58:00 AM
cardiff lab is effectively setup as a customer

**Gareth Tucker** - 5:58:44 AM
nice, ok, ignore me for now then, sounds like you can sort internally

**Daniel Iwan** - 7:48:27 AM
here are sample events from media info which have incorrect format

*Attachments:*
- bad-events-paths.txt

**Jez Tucker** - 8:29:18 AM
Daniel Iwan re the above ^^ and not the task failures


The workflow is processing directories, which is why you have files in an array and a dir path for the object key.


So options:



change the workflow to only process files / do not process directories in the mediainfo task in hubleverage directory processing as a good thing vision side
What's your preference?

**Daniel Iwan** - 8:33:27 AM
we cannot bundle events together  because of the single s3 key, unless we change the event format. If I understood 2. correctly

**Jez Tucker** - 8:35:42 AM
cool. we'll sort it out our side.  won't be long.

**Jez Tucker** - 8:36:29 AM
have you (or someone) managed to eyeball the x-directory  mime type yet?  if it's not quite right there is an opportunity to attend to it while the etag fsid is being twiddled

**Daniel Iwan** - 8:37:43 AM
I'll check that now

**Daniel Iwan** - 8:44:37 AM
looks good to me


size is not 0 but that is from GPFS I think

*Attachments:*
- Screenshot 2025-07-10 at 16.44.14.png

**Christopher Oates** - 8:46:40 AM
I'm tweaking the workflow, currently it's matching type 'all' for creates, which is equivalent to file+directory+symlink


are you interested in symlinks for either/both of mediainfo and filenotify?

**Daniel Iwan** - 8:50:17 AM
I'm not sure how versity deals with symlinks, events would have to mirror that

**Jez Tucker** - 8:51:36 AM
perhaps something to add to the testing list atm.  why don't we leave them off the workflow right now?
*Reactions: 👍, 👍*

**Daniel Iwan** - 8:53:16 AM
from a quick read it seems symlinks are exposed as normal files i.e. referenced ones so both mediainfo/filenotify events would apply. Agree, Jez

**Jez Tucker** - 8:59:03 AM
okie. we'll apply a workflow change this eve ready for new testing tomorrow am
*Reactions: 👍*

**Jez Tucker** - 12:13:39 PM
workflow updated on both nodes
*Reactions: 👍*


## 7/11/2025

**Jez Tucker** - 5:43:56 AM
Daniel Iwan we have the PR up for the etag changes (fsid on head & list object only).  for you is this a today/monday (not for you) thing?

**Gareth Tucker** - 5:45:16 AM
Split between a few Jez, primary was David who is off today so not much will happen from our side until Monday there

**Gareth Tucker** - 5:45:32 AM
The other was for creating folders in Vision which affects all and could be checked today

**Gareth Tucker** - 5:45:40 AM
but is not a blocker, the folder is created, but you get an error

**Jez Tucker** - 5:46:09 AM
ok. we will position it for integration monday then.


I did not want to make changes to the system today if you are focused on things

**Gareth Tucker** - 5:46:22 AM
works for us, thanks

**Jez Tucker** - 5:46:24 AM
can we get some more detail on 'you get an error'

**Gareth Tucker** - 5:47:48 AM
Failed creating folder on S3 (Gareth/Test/): Input is expected to be encoded in multiple of 2 bytes but found: 39

**Gareth Tucker** - 5:48:17 AM
That is currently what Vision displays in the UI when you try to create a folder

**Jez Tucker** - 5:48:51 AM
so, if I am understanding correctly.



create space 'bob'apply iris state as per supporting docupload a folder to the versity s3 endpoint key='bob/newfolder'above error seen ?

**Gareth Tucker** - 5:49:13 AM
yeah, that should do it

**Gareth Tucker** - 5:50:09 AM
It might be client specific tho e.g. Vision doesn't like it, but you may get away with it via something else if going direct to Versity

**Jez Tucker** - 5:50:46 AM
could again be etag related.  any debug output from the AWS S3 SDK ?

**Gareth Tucker** - 5:51:50 AM
yeah, we expect it to be ETag, I will have a quick check server side

**Jez Tucker** - 5:53:32 AM
ok. in which case it may indeed be worth replacing the versity with the etags 'vision mode' version

**Jez Tucker** - 5:53:55 AM
I could do it on node2 first if useful

**Gareth Tucker** - 5:55:05 AM
Looks to confirm the same theory from the logs


 



2025-07-11T12:47:37.207Z  WARN 1 --- [nio-8504-exec-4] c.o.v.mcs.microservices.s3.S3Gateway     : S3 error creating a folder on bucket space01 with key Gareth/Test/


 


java.lang.IllegalArgumentException: Input is expected to be encoded in multiple of 2 bytes but found: 39

        at software.amazon.awssdk.utils.internal.Base16Codec.decode(Base16Codec.java:56) ~[utils-2.20.88.jar:na]

        at software.amazon.awssdk.utils.internal.Base16Lower.decode(Base16Lower.java:65) ~[utils-2.20.88.jar:na]

        at software.amazon.awssdk.services.s3.checksums.ChecksumsEnabledValidator.validatePutObjectChecksum(ChecksumsEnabledValidator.java:162) ~[s3-2.20.88.jar:na]
 



 


It's not happy validating the checksum returned by the PUT

**Jez Tucker** - 5:55:22 AM
ok. i reckon we'll have that build inside the hour

**Jez Tucker** - 5:55:33 AM
an hour, not the hour

**Gareth Tucker** - 5:56:51 AM
K, happy to save for Monday, looks to be a known quantity and we'll need David to make some changes to proxy gen to ensure that is also happy with the change in place

**Jez Tucker** - 6:04:22 AM
noted. gives me some time to kick it then

**Daniel Iwan** - 6:04:43 AM
the workaround for that was new AWS SDK and 2 env variables which we can remove to test new version

**Jez Tucker** - 6:04:51 AM
any vision updates expected for the integration build to feed in ?

**Gareth Tucker** - 6:07:11 AM
for a new PixStor for Monday?

**Jez Tucker** - 6:13:12 AM
yep

**Gareth Tucker** - 6:13:14 AM
nice, so no code changes required then, just config update and container restart by the sound of it

*Attachments:*
- messageReference

**Jez Tucker** - 6:13:36 AM
cool. sounds good to go then, just the pkgs our side

**Gareth Tucker** - 6:14:09 AM
Daniel Iwan do you want to change any versions this week, or continue to update manually as we have been over the last couple of weeks?

**Gareth Tucker** - 6:25:38 AM
Jez Tucker please carry on with your integration build, we'll continue to update our bits manually for now

**Jez Tucker** - 6:32:41 AM


**Gareth Tucker** - 7:36:39 AM
Jez Tucker MetadataGenerated events looks good from what I can see so far following the latest update.


 


I cannot seen any broken keys anymore for files within .resources.


 


I am also only seeing MediaInfo for a single object per event as desired rather than an array.

*Attachments:*
- messageReference
*Reactions: 👍*

**Jez Tucker** - 7:49:37 AM
super. we'll cross that one off then

**Gareth Tucker** - 11:26:37 AM
Hi All, little end of week roundup detailing where we are at.


 


Basic testing shows that we have the following working on PixStor Dev 01 in Cardiff



Listing spaces via Ngenea Hub usernamePixStor filesystem events integration in Vision including

Display files created on the filesystemSearch for files created on the filesystemCreate and display proxy resources for files created on the filesystemRemove files from display/search when deleted on the filesystemHandle files renamed/moved on the filesystem including

Display the renamed/moved filesSearch for the rename/moved filesDisplay the proxy resources for the renamed/moved files

MediaInfo integration including

Display of MediaInfo in Vision for media filesSearch for files in Vision against MediaInfo metadata
Display of PixStor Online status in VisionNgenea Hub workflow integration via Vision including

Trigger migrate workflowTrigger recall workflowDynamic workflow options based on Online statusTrigger Send to Site (see To-Do)
Subclip files in Vision
and some high level to-do's remaining for next week include



Update Vision to prevent listing/searching spaces that the user does not have access toAI+ Integration with Vision via RabbitMQFinish Ngenea Hub workflow progress reporting in VisionFull Send to Site integration testing including 2nd Site
A fantastic effort by all this week, getting close now  Have a great weekend.

**Barry Evans** - 11:27:24 AM
Great work guys!

**Unknown User** - 11:34:24 AM


**Jamie Sabino** - 11:34:28 AM
Jason Perr ^^


## 7/14/2025

**Richard Gittens** - 1:48:53 AM
Morning all, Can anyone give me the command to set my test file's 'storage class' to not(Unmanaged/Premigrated/Migrated).


I want to check that Vision does not show an Online Status value for my uploaded file when it doesn't have any of above storage classes.


 


root@ca-sn-dev-01:/mmfs1/data/qa/AI # ls -la TestFile.mov

-rw-r--r-- 1 root root 3088479 Jul 14 09:22 TestFile.mov


 


Cheers

**Jez Tucker** - 1:58:06 AM
ngls <file>

**Jez Tucker** - 1:59:19 AM
- is unmanaged               (new file, never been processed by ngenea)
p is premigrated
m is migrated

**Richard Gittens** - 2:23:16 AM
Cheers Jez, but is there anyway to manually set the storageClass of the file from the command line?

**Jez Tucker** - 2:27:09 AM
you could:






 


mkdir file_states
cd file_states
echo 1234 > unmanaged
echo 1234 > premigrated
echo 1234 > migrated
ngmigrate -p premigrated
ngmigrate -m migrated

**Jez Tucker** - 2:27:30 AM
then ngls (and versity gw) will show a file in each state

**Richard Gittens** - 2:27:56 AM
Cheers

**Jez Tucker** - 2:28:01 AM
I can do this for you in some file system area under /mmfs1/data/<space> if you need

**Richard Gittens** - 2:45:45 AM
Cheers Jez, I can test the different states that uploaded files can have via Vision (using the Archive/Recall workflows) but I wanted to force a file to have an unknown state (e.g null or 'x') so that Vision will display the appropriate info i.e , a blank 'Online Status' field entry or no 'Online Status' field at all. Hope that clarifies things.

**Richard Gittens** - 2:52:30 AM


*Attachments:*
- Online Status field.JPG

**Jez Tucker** - 3:06:14 AM
hey Richard Gittens let's have a call else this'll be a very long teams chat   how are you fixed?

**Barry Evans** - 3:07:38 AM
This can get confusing quick, so throwing my 2 penneth in on this again - with Vision, at least for today, there should only be online and offline. Online would be basically any state (unmanaged, premigrated, etc) except for offline - and offline would simply just be offline

**Barry Evans** - 3:08:24 AM
potential for that to change down the road so keep the options open, but for the type of user we're targetting, we want to try and keep things simple for the time being
*Reactions: 👍, 👍*

**Richard Gittens** - 3:25:11 AM
Cheers Guys, no problem. I was testing a jira/task which stated the following:-


 


=============================================================


The Online Status should be displayed in the File Information section of the metadata panel.


Label = Online Status


Value = Display the storage class returned by S3 listing, unmodified.


If the storage class does not match any of those detailed in the story, don’t display Online Status.


==============================================================


 


But we can leave the entirety of this test for further down the line.

**Barry Evans** - 3:30:33 AM
our inclusion of storage class into ngenea was well intentioned, but has not led to much usefellness (some, but not much). Once the file has been migrated and then subsequently tiered (example S3 Standard -> Deep Glacier) by the cloud provider, we lose sight of that storage class. 90% of the time it's meaningless so it's probably better to keep away from that for the time being.

**Jez Tucker** - 3:33:32 AM
Richard Gittens I think you'll just need to achieve your QA as a synthetic test.  ngenea will not return a state which does not match those, versity should not either.  we can't manually make a state you are looking for.
*Reactions: 👍*

**Gareth Tucker** - 3:37:07 AM
Richard Gittens that info is out-of-date too by the look of it, correct details are in the description on this story


 


https://perifery.atlassian.net/browse/MCS-1314


 


Thanks Jez Tucker for the ngmigrate commands too, that should allow Rich to make sure everything displays as needed.
*Reactions: 👍*

**Jez Tucker** - 3:39:40 AM
Super. I would like to upgrade the versity rpms at some suitable point.  Do you want to do this before meeting, or during meeting?

**Gareth Tucker** - 3:40:14 AM
before works Jez, just give us a heads up when please

**Jez Tucker** - 4:08:38 AM
Gareth Tucker I can do this now.  Will take < 2 mins

**Gareth Tucker** - 4:10:15 AM
OK, should be transparent to most but Everyone you may temporarily lose access to objects on PixStor Dev 01 via Vision while Jez does this restart

**Jez Tucker** - 4:10:38 AM
yup. starting now

**Jez Tucker** - 4:12:03 AM
node1 done






 


versitygw-iris[1190107]: │etag generation from inode: vision (get/head/list operations only)  │
versitygw-iris[1190107]: └────────────────────────────────────────────────────────────────────┘

**Jez Tucker** - 4:12:10 AM
all back up

**Jez Tucker** - 4:12:17 AM
doing node 2 now

**Jez Tucker** - 4:15:24 AM
.. well.. when I get an ssh connection (not a cardiff lab issue..)

**Jez Tucker** - 4:24:24 AM
ok. that's not going to fly right now. node2 will need to occur later today
*Reactions: 👍*

**Gareth Tucker** - 4:26:00 AM
Thanks Jez

**Daniel Iwan** - 4:30:54 AM
creating folders works as expected, so does the upload
*Reactions: 👍*

**Daniel Iwan** - 4:41:14 AM
versitygw went down during my upload I think, directly over aws s3 cli

**Daniel Iwan** - 4:43:43 AM
SIGSEGV and panic






 


Jul 14 12:35:24 ca-sn-dev-01 versitygw-iris[1190107]: 12:35:23 | 200 |     8.20107ms | 127.0.0.1 | GET | /space01/.resources/9e/0f/-10848671671403863553-268291-782495846/thumb.jpeg | - | response-content-disposition=attachme
nt&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250714T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=YjOdY5dRBNqd9JnGEuLiBYQxQfFbBf7Q%2F20250714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=c2e94
2b220657d0398a90d9c258cfd6ed4f6bbea5fa11de37e35061f970d66be
Jul 14 12:35:24 ca-sn-dev-01 versitygw-iris[1190107]: 12:35:23 | 200 |    6.565693ms | 127.0.0.1 | GET | /space01/.resources/ce/63/-10848671671403863553-275972-1906784851/thumb.jpeg | - | response-content-disposition=attachm
ent&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250714T000000Z&X-Amz-SignedHeaders=host&X-Amz-Expires=604800&X-Amz-Credential=YjOdY5dRBNqd9JnGEuLiBYQxQfFbBf7Q%2F20250714%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=ad62
15584bbf8e96531a619d65f2b509ecc4712e39f62316a6c8a83cbed006d0
Jul 14 12:38:47 ca-sn-dev-01 versitygw-iris[1190107]: 12:38:47 | 200 |    2.169804ms | 127.0.0.1 | GET | /curlspacestest2 | - | list-type=2&delimiter=%2F&max-keys=50&prefix=
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]: 12:38:50 | 200 |  151.272992ms | 127.0.0.1 | POST | /space01/Daniel/part1-clone.mov | - | uploads
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]: panic: runtime error: invalid memory address or nil pointer dereference
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]: [signal SIGSEGV: segmentation violation code=0x1 addr=0x18 pc=0x17a94dd]
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]: goroutine 14 [running]:
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]: github.com/versity/versitygw/s3api/utils.(*HashReader).Read(0xc0002ff8c0, {0xc00029b000, 0xa6048b?, 0x1000})
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/utils/csum-reader.go:109 +0x3d
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]: github.com/versity/versitygw/s3api/utils.(*AuthReader).Read(0xc000402000, {0xc00029b000?, 0xa6048b?, 0xc000121d08?})
Jul 14 12:38:50 ca-sn-dev-01 versitygw-iris[1190107]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/utils/auth-reader.go:75 +0x2b
*Reactions: 💣*

**Daniel Iwan** - 5:04:12 AM
Upload via vision and proxygen still works, also without special flags AWS_REQUEST_CHECKSUM_CALCULATION , AWS_RESPONSE_CHECKSUM_CALCULATION. Not needed at least not on the versitygw 0.1.14.1189


I will remove those
*Reactions: 👍*

**Unknown User** - 6:01:21 AM


**Unknown User** - 6:01:31 AM


**Unknown User** - 6:52:35 AM


**Unknown User** - 6:52:36 AM


**Unknown User** - 6:55:47 AM


**Jez Tucker** - 7:09:44 AM
Daniel Iwan  we would like to run up the versity in debug mode to collect more info on that segfault.  then have you trigger it, then take the debug mode off.  please let me know when suits.

**Daniel Iwan** - 7:15:17 AM
ok to do it now I think

**Jez Tucker** - 7:21:22 AM
ok.  looking now..

**Jez Tucker** - 7:23:46 AM
ok. we good. please run amok
*Reactions: 👍*

**Daniel Iwan** - 7:26:11 AM
done

**Jez Tucker** - 7:30:23 AM
thx. just checking if anything else is needed prior to reverting

**Jez Tucker** - 7:40:51 AM
Daniel Iwan can you do this one more time please?

**Jez Tucker** - 7:41:51 AM
infact pls hold. just configing core dumps

**Daniel Iwan** - 7:44:57 AM
sure, let me know when

**Jez Tucker** - 7:46:46 AM
ok. try now.


we would also appreciate a reproducible method


and information about the file being uploaded (size for example..)

**Jez Tucker** - 7:48:25 AM
ok. hypothesis is that this is a bug in the underlying versity app.  we'll need to investigate and confirm

**Daniel Iwan** - 7:49:13 AM
aws s3 cp --no-verify-ssl --endpoint-url https://ca-sn-dev-01.om.cardifflab:7071 ~/Downloads/part1.mov s3://space01/Daniel/part1-clone.mov
Credentials via AWS_ env variables


this is our part1.mov we have in Vision


 



 


ls -la ~/Downloads/part1.mov
-rw-r--r--@ 1 daniel  staff  111058192 10 Jul 17:52 /Users/daniel/Downloads/part1.mov
 


on macOS


 



 


aws --version
aws-cli/2.27.50 Python/3.13.5 Darwin/24.5.0 source/arm64

**Jez Tucker** - 7:54:33 AM
ok. thx. you are up and running again
*Reactions: 👍*

**Gareth Tucker** - 10:20:26 AM
Erik Salter did you have any joy writing AI+ metadata messages to RabbitMQ on 10.161.244.101 for us to review?

**Erik Salter** - 11:08:58 AM
We're finalizing the implementation today, so we'll give it a shot later today or tomorrow.

**Gareth Tucker** - 11:16:24 AM
Thanks Erik, keep us posted please

**Unknown User** - 12:11:50 PM


**Erik Salter** - 12:12:55 PM
Justin Toribio -- from Daniel Iwan


 


Rabbit should be accessible on 10.161.244.101 over standard 5671 with TLS.


CA cert for that server should be the one included. This is generated by internal vision stack CA, and not the one exposed by nginx, but it should be OK for your dev purposes


 


metadata exchange is there so you should be able to publish to it.


Let us know once you have so we can have a look at the messages


ftl-01-ca-mcs.crt

*Attachments:*
- ftl-01-ca-mcs.crt


## 7/15/2025

**Gareth Tucker** - 9:46:20 AM
Jez Tucker it looks like Versity has had a moment in the middle of an upload again but slightly different to before


 



Jul 15 17:14:28 ca-sn-dev-01 versitygw-iris[2499199]: 17:14:28 | 200 |    50.94356ms | 127.0.0.1 | PUT | /qa/AI/2files/xaaafwc | - | partNumber=1&uploadId=2a2d39a2-7cc3-4bd3-ae0b-50dc82570021&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250715T161428Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Credential=YjOdY5dRBNqd9JnGEuLiBYQxQfFbBf7Q%2F20250715%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=44273cbfafa739c678d9c45dcd799c084d0fb277ec599879400b389cc81ded2c

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: 17:14:28 | 200 |  109.009467ms | 127.0.0.1 | POST | /qa/AI/2files/xaaafwd | - | uploadId=fd99d778-0a7b-480e-a81e-dfb25b27086a

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: fatal error: concurrent map writes

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: goroutine 946 [running]:

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: github.com/versity/versitygw/backend/ngenea.(*Ngenea).CompleteMultipartUpload(0xc000168d70, {0x2008958?, 0xc00059c608?}, 0xc00014c2c0)

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/backend/ngenea/ngenea.go:514 +0x307

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: github.com/versity/versitygw/s3api/controllers.S3ApiController.CreateActions({{0x201ace0, 0xc000168d70}, {0x200e0e0, 0xc000507200}, {0x0, 0x0}, {0x0, 0x0}, 0x0, 0x0, ...}, ...)

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/controllers/base.go:3718 +0x19e4

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: github.com/gofiber/fiber/v2.(*App).next(0xc000185908, 0xc000398608)

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:143 +0x1be

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: github.com/gofiber/fiber/v2.(*Ctx).Next(0x1c46800?)



 


and it looks like it dies shortly afterwards


 



Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: github.com/valyala/fasthttp.(*workerPool).workerFunc(0xc0001ee000, 0xc000626000)

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:220 +0x53

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: github.com/valyala/fasthttp.(*workerPool).getCh.func1()

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:197 +0x32

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]: created by github.com/valyala/fasthttp.(*workerPool).getCh in goroutine 4

Jul 15 17:14:29 ca-sn-dev-01 versitygw-iris[2499199]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:196 +0x194

Jul 15 17:14:30 ca-sn-dev-01 systemd[1]: versitygw@iris.service: Main process exited, code=exited, status=2/INVALIDARGUMENT

Jul 15 17:14:30 ca-sn-dev-01 systemd[1]: versitygw@iris.service: Failed with result 'exit-code'.



 


Anything that you would like us to do before we attempt to restart it?

**Jez Tucker** - 10:55:02 AM
we think this is an issue in versity itself, not the ngenea additions we've added.  it appears to be in the hashing backend.  unsure why it's newly observed.  I think right now, just restart it.  


I'll write a page on gathering info / reverting tomorrow
*Reactions: 👍*

**Gareth Tucker** - 11:07:46 AM
FYI, I have restarted for now and things seem to be back up and running as expected. We can take a look closer at the logs in the morning.


## 7/16/2025

**Jez Tucker** - 1:53:16 AM
Added Antony "Tony" Imbierski.  Interesting that we are so far unable to reproduce this in lab.  Would like to see if we can do so on the second cardiff node.   Gareth Tucker Let's catch up after your standup.
*Reactions: 👍*

**Jez Tucker** - 1:53:54 AM
Antony "Tony" Imbierski last night's slightly different issue is just above ^^

**Jez Tucker** - 3:52:59 AM
Obs so far on the versity issue.


Appears to be a reproducible issue when using aws cli v2 specifically with the nginx reverse proxy port.  Going direct to versity does not reproduce the issue.  Using aws cli v1 does not reproduce the issue on either port.


This can be reproduced on the cardiff 2nd node too.

**Barry Evans** - 3:59:32 AM
ooooh

**Jez Tucker** - 4:08:12 AM
We are upgrading cardif02 as a quick test of the produced image and then doing florida straight after.
*Reactions: 👍*

**Gareth Tucker** - 4:18:38 AM
Jez Tucker for the Versity GW investigation, we currently use AWS SDK for Java v2 in two places, versions for which are below


 


Vision API / mcs-vision-api: 2.20.88


Proxy Gen / mcs-mte-media-transformer-engine: 2.31.77

**Jez Tucker** - 5:05:28 AM
Hey Gareth Tucker I think this latest vision tarball has a deployment issue






 


ERROR: Failed to list tenants. Cause EOF occurred in violation of protocol (_ssl.c:1010). Retrying
Successfully listed tenants after 22.965 seconds
Setting up Generic S3 tenant
Creating secret files for mcs-proxygen in /var/lib/pixstor/iris/mcs-runtime/output/secrets
Tenant created
Tenant creation finished, Wed Jul 16 12:56:43 BST 2025
Configured with Iris (Pixstor/Ngenea deployment)
Python virtual environment not found at /var/lib/pixstor/iris/mcs-runtime/scripts/bin-python/venv. Creating...
/var/lib/pixstor/iris/mcs-runtime/scripts/vman.sh: line 49: python: command not found
ERROR: (function __exitHandler()) Exiting script after error 127 in caller: 1 /usr/share/mcs-setup/scripts/mcs-setup.sh



so therefore we cannot






 


root@ca-sn-dev-02:/etc # egrep '(adminUsername|adminPwd)' /var/log/vision_install.log 



Would you like to have a looksie ?

**Gareth Tucker** - 5:09:47 AM
Yep, I will take a look, we should be able to manually work around that

**Gareth Tucker** - 5:28:05 AM
Looks to be environment based, vman.sh 


 


/usr/share/mcs-setup/scripts/install-files/vman.sh


 


assumes that a default version of python will be defined but that doesn't look to be the case on either host at the moment. Dan has tripped up on this already I think and it can be worked around a couple of ways. Either make sure that we can simply execute python from the command line without choosing a version, or modify vman.sh to be explicit, using something like 3.12 as Dan mentions in a comment


 



# replace with python3.12 as needed

PYTHON_EXEC="python"

**Gareth Tucker** - 5:37:19 AM
I believe vman.sh requires Python 3.9 or above so we can't rely on what is set up when calling python3 on those hosts as it is currently set to 3.6


 



root@ca-sn-dev-02:~ # python3 --version

Python 3.6.8



 


and Dan was unsure which versions of python would come with new PixStor images, so didn't hardcode to 3.12 for that reason which is available on Dev 01 and Dev 02

**Jez Tucker** - 5:45:14 AM
ok. so is the procedure do the destroy, alter the file and then re-run the salt states ?

**Gareth Tucker** - 5:46:07 AM
Yeah, best to destroy first, manually update vman.sh, then re-run the setup via salt

**Jez Tucker** - 5:46:22 AM
ok. I shall bosh this through
*Reactions: 👍*

**Jez Tucker** - 6:36:37 AM
yeah. not sure this will fly.  destroy removes the vman.sh and parent folders.


salt untars over the top if i put it in place.


we might have to not destroy, but delete the containers and re-salt with the tweaked file


trying that angle

**Jez Tucker** - 6:38:12 AM
ideally, if you could move the python_exec into the config file and derive from there, things would work smoother

**Gareth Tucker** - 6:46:18 AM
ah bummer, sure, whatever we think is the best approach we can modify setup later to sort that

**Jez Tucker** - 6:47:17 AM
it's all good. having a fiddle for a bit.  I have a meeting then I will stick my head up and see where we are at
*Reactions: 👍*

**Gareth Tucker** - 6:47:22 AM
guess we need to try and work around for now to avoid needing a new PixStor image

**Jez Tucker** - 7:42:17 AM
Gareth Tucker I think we might be good.  Can you sanity check node-02 for me?

**Jez Tucker** - 7:43:00 AM
Hmm. I say that.  Still an outstanding item: "WARNING: Ngenea API Key not configured. Please configure it post installation."


Looking at that.

**Jez Tucker** - 7:43:42 AM
as we can't do exports inline for pixstor apply, I added it to profile.d.   Seems to not read that when running.

**Gareth Tucker** - 7:44:44 AM
ok, we should be able to add it manually if needed

**Jez Tucker** - 7:45:05 AM
ok. key is in /etc/profile.d/vision.sh

**Gareth Tucker** - 7:45:20 AM
Ta.


 


Need to sort something out quickly and then will take a look.

**Jez Tucker** - 7:45:27 AM
I'll delete it once you have done a manual add (or you can..)
*Reactions: 👍*


## 7/17/2025

**Barry Evans** - 1:24:37 AM
how are we looking guys

**Gareth Tucker** - 1:25:36 AM
Morning Barry, we have PixStor Dev 02 running end to end now in Cardiff

**Barry Evans** - 1:25:47 AM
florida?

**Gareth Tucker** - 1:26:22 AM
Next once Jez and I have caught up

**Gareth Tucker** - 1:26:39 AM
currently documenting any manual stuff required post install

**Barry Evans** - 1:26:50 AM
ok - that needs on today, in the UK sense of today
*Reactions: 👍*

**Barry Evans** - 1:26:59 AM
anything you need from me, let me know

**Gareth Tucker** - 1:30:51 AM
FYI, I am on a half day with an early start/finish, hoping to be offline by 11:30am, Polly will be around to help out with the install though if it continues past that

**Jez Tucker** - 1:40:29 AM
Gareth Tucker it all looked reasonably ok bar some loose ends late yesterday.  Any reason I cannot crack on with the install anyway?

**Gareth Tucker** - 1:41:11 AM
Sure thing

**Jez Tucker** - 1:41:22 AM
cool. will get that rolling then as it's the longest part

**Gareth Tucker** - 1:41:34 AM
changes should be documented once you are done

**Jez Tucker** - 2:11:14 AM
FYI. the latest vision release does not appear to have the new config vars rolled in.  I am hand patching each time.  I'll add it to docs.
*Reactions: 👍*

**Gareth Tucker** - 2:13:20 AM
My updates are on your doc now too, I just need to proof them when out of calls


 


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4343562246/Cardiff+Lab+Hub+Use+Guidance#Vision-Install

**Jez Tucker** - 2:21:00 AM
fl node 1 is pixstor applying.  perfect place to proof them ?

**Jez Tucker** - 2:21:15 AM
give me a shout when free

**Gareth Tucker** - 2:34:33 AM
Sounds good, quick loo break and we'll get together

**Jamie Sabino** - 6:11:07 AM
Let me know if there’s a bridge for the work in Florida. If possible I would like to execute the steps (but sounds like given rhe thread above, it’s not exactly rock solid yet, which I get 100%)

**Jamie Sabino** - 6:12:07 AM
Also need to get the details of how the rabbit service is running so I can start integrating with the ai+ node services.

**Barry Evans** - 6:47:33 AM
Jamie Sabino I think Jez and Polly are squirreled away somewhere, they should surface soon. I think they are just about done with node 1 and then moving on to node 2

**Barry Evans** - 6:47:59 AM
next week we will also need to do the ASG lab, and, Orlando will be back. We should make sure you are fully wrapped into that as well

**Barry Evans** - 6:48:30 AM
ALT, not ASG, sorry, too many resellers

**Jamie Sabino** - 6:50:16 AM
Barry Evans ack.  Important for me to know full e2e deployment / infra as we build our own out too and tie in work towards validation and building that out.

**Barry Evans** - 7:00:19 AM
100%

**Jez Tucker** - 7:30:17 AM
We are indeed in the thick of it atm.  But hopefully not /that/ far away.


However Jamie Sabino if you could add an extra 20GB to the /var on each node that would likely make several issues insta-disappear.

**Jamie Sabino** - 7:53:36 AM
are you blocked by this now? Jessica set these up with here references, i can look at modifying those vm's, but likely the will be taken down to do it

**Jamie Sabino** - 8:10:56 AM
actually just looking into it and there's a way to expand it.. Jez Tucker want me to try it?  i don't want to disrupt anything on your end, i can try extending it now

**Jamie Sabino** - 8:16:15 AM
root@ftl-dev-sn-01:~ # df -hT /var

Filesystem                                  Type  Size  Used Avail Use% Mounted on

/dev/mapper/pixstor-var--6.10.0--0.alpha.13 ext4   40G   18G   20G  48% /var

[Px] Staging mode     [Px]

root@ftl-dev-sn-01:~ #


 


 


root@ftl-dev-sn-02:~ # df -hT /var

Filesystem                                  Type  Size  Used Avail Use% Mounted on

/dev/mapper/pixstor-var--6.10.0--0.alpha.13 ext4   40G   17G   22G  44% /var

[Px] Staging mode     [Px]

root@ftl-dev-sn-02:~ #



 


Jez Tucker ^ 20g added on both /var

**Jez Tucker** - 8:20:50 AM
Hiya Jamie Sabino I think you are best working with Jessica Harris to achieve this.  I'll let her know.


We believe we have finished node01 (finally!)


Need to do a QA. But at the high level:


 



latest versions of hub and vision deployedversity s3 buckets availablerabbitmq being notified of new files and metadata from hubcan migrate from visioncan recall from visionupload from desktop to vision works

uploadfile is delivered to versity s3 gatewayhub VisionNotify schedule runs every minutenew file detected

file_notify -> vision rabbitmqmediainfo -> vision rabbitmq
proxygen add metadata
PROFIT

**Barry Evans** - 8:21:57 AM
Jez Tucker i think Jamie is saying that he has achieved it
*Reactions: 👍*

**Jez Tucker** - 8:22:36 AM
yeah. messages crossed while typing

**Jez Tucker** - 8:22:47 AM
that will make node2 a lot easier

**Jez Tucker** - 8:22:54 AM
but going to attack that one tomorrow


## 7/21/2025

**Unknown User** - 6:00:36 AM


**Unknown User** - 6:00:46 AM


**Jez Tucker** - 6:04:32 AM
USE_TEST_BUILDS=true pixstor-upgrade 6.10.0-0.alpha.14

reboot




post reboot: 


pixstor apply

**Orlando Richards** - 6:13:35 AM
Content-Disposition

**Orlando Richards** - 6:20:29 AM
Versity changelog includes this line:


 



65261a9 feat: Adds the Content-Disposition, Content-Language, Cache-Control and Expires object meta properties support in the gateway.

 
in v 1.0.12 - we're on 1.0.14

**Orlando Richards** - 6:21:09 AM
Here's the diff: https://github.com/versity/versitygw/commit/65261a9753288778f1fddf26cc7f8615edad5814

**Jamie Sabino** - 6:51:42 AM
brb

**Orlando Richards** - 6:56:14 AM
What API function do you call Gareth Tucker?

**Unknown User** - 7:01:06 AM


**Unknown User** - 7:01:08 AM


**Unknown User** - 7:06:29 AM


**Orlando Richards** - 7:55:34 AM
Gareth Tucker - i set the quota to 1MB and it's working now
*Reactions: 👍*

**Orlando Richards** - 7:55:43 AM
i think 1GB might have still been too big?

**Jez Tucker** - 7:59:38 AM
actually Gareth Tucker can you paste me in the url with the content-disposition, that'd be awfully handy

**Gareth Tucker** - 8:03:38 AM
https://ca-sn-dev-01.om.cardifflab:7071/qa/Gareth/How%20Did%20The%20Sriracha%20Shortage%20Happen.mp4?response-content-disposition=attachment&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250721T150253Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Credential=YjOdY5dRBNqd9JnGEuLiBYQxQfFbBf7Q%2F20250721%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=dd9906cf0d25fef31de636cfc794cf8ffc37e20726d709f8d5e80827e7a85961

**Jez Tucker** - 8:19:55 AM
much ta

**Jez Tucker** - 8:32:21 AM
Hey Polly Miller  does this track like the ca cert issue we had on the Thu?






 


Jul 21 16:28:03 hw-dev-hub-01 9454effa9a8a[2609]: Enabling Java Native Memory Tracking
Jul 21 16:28:03 hw-dev-hub-01 9454effa9a8a[2609]: Adding 148 container CA certificates to JVM truststore
Jul 21 16:28:03 hw-dev-hub-01 9454effa9a8a[2609]: Spring Cloud Bindings Enabled
Jul 21 16:28:03 hw-dev-hub-01 9454effa9a8a[2609]: Picked up JAVA_TOOL_OPTIONS: -Djava.security.properties=/layers/paketo-buildpacks_bellsoft-liberica/java-security-properties/java-security.properties -XX:+ExitOnOutOfMemoryError -XX:MaxDirectMemorySize=10M -Xmx388920K -XX:MaxMetaspaceSize=147655K -XX:ReservedCodeCacheSize=240M -Xss1M -XX:+UnlockDiagnosticVMOptions -XX:NativeMemoryTracking=summary -XX:+PrintNMTStatistics -Dorg.springframework.cloud.bindings.boot.enable=true
Jul 21 16:28:03 hw-dev-hub-01 systemd[1]: run-docker-runtime\x2drunc-moby-4e48b818894aca887afd4adb5f515474f1acf2536de29e96100674ebc7a9d650-runc.aqWnUW.mount: Succeeded.
Jul 21 16:28:03 hw-dev-hub-01 b4f833f68cdb[2609]: 2025-07-21T15:28:03.965Z  WARN 1 --- [           main] c.om.mcs.mapi.keycloak.KeycloakService   : Failed to connect to Keycloak. Please make sure hostname and port are correct and Vault service is running and is accessible over the network.
Jul 21 16:28:03 hw-dev-hub-01 b4f833f68cdb[2609]: 
Jul 21 16:28:03 hw-dev-hub-01 b4f833f68cdb[2609]: javax.ws.rs.ProcessingException: RESTEASY004655: Unable to invoke request: javax.net.ssl.SSLHandshakeException: The certificate chain is not trusted

**Polly Miller** - 8:35:19 AM
Jez Tucker Seems likely. What component is logging this?

**Jez Tucker** - 8:35:42 AM
Jul 21 16:32:24 hw-dev-hub-01 b4f833f68cdb[2609]: .   ,  ,-.  ,-.      .   ,  ,.  ;-.  , 
Jul 21 16:32:24 hw-dev-hub-01 b4f833f68cdb[2609]: |\ /| /    (   `     |\ /| /  \ |  ) | 
Jul 21 16:32:24 hw-dev-hub-01 b4f833f68cdb[2609]: | V | |     `-.  --- | V | |--| |-'  | 
Jul 21 16:32:24 hw-dev-hub-01 b4f833f68cdb[2609]: |   | \    .   )     |   | |  | |    | 
Jul 21 16:32:24 hw-dev-hub-01 b4f833f68cdb[2609]: '   '  `-'  `-'      '   ' '  ' '    '

**Jez Tucker** - 8:36:20 AM
I am wondering why; since I've done a destroy, rm -r etc. etc. I am hitting this consistently

**Jez Tucker** - 8:36:42 AM
We have space this time too

**Polly Miller** - 8:37:09 AM
I don't know why it might be a problem, but check the content of this folder, does it have the same files?






 


root@ca-sn-dev-01:/var/lib/pixstor/iris/mcs-runtime # ls -l mcs-mapi/ca-certificates/binding/
total 12
-r--r--r-- 1 root root 1606 Jun 20 17:12 ca.crt
-rw-r--r-- 1 root root 2313 Jun 20 17:12 pixstor-ca_ca_cert.crt
-rw-r--r-- 1 1002 1000   15 Jun 20 17:12 type

**Jez Tucker** - 8:37:48 AM
I do have those 3 files.

**Jez Tucker** - 8:38:21 AM
I think it's more this: Caused by: javax.net.ssl.SSLHandshakeException: The certificate chain is not trusted

**Jez Tucker** - 8:39:00 AM
if you do have time to look, we can do so


if not I will hit it with hammer #7

**Polly Miller** - 8:39:33 AM
We can spend some time looking at it

**Polly Miller** - 9:11:04 AM
MCS_VISION_DOMAIN


## 7/28/2025

**Unknown User** - 6:01:09 AM


**Unknown User** - 6:01:17 AM


**Jamie Sabino** - 6:11:29 AM
brb

**Orlando Richards** - 6:15:32 AM
pixstor config set ngeneahub:ngclient:api_key $(grep client_key /etc/ngenea/ngenea-client.conf | gawk '{print $NF}')

**Gareth Tucker** - 6:16:57 AM
root@ca-sn-dev-01:~ # pixstor apply --test
ca-sn-dev-01.pixstor:
    Data failed to compile:
----------
    Pillar failed to render with the following messages:
----------
    Failed to load ext_pillar iris: argument should be a bytes-like object or ASCII string, not 'NoneType'

**Orlando Richards** - 6:17:22 AM
https://arcapix.atlassian.net/wiki/spaces/ORDOCS/pages/4966187010/2025-06-06+Deploying+Vision+on+PixStor+6.10+dev+builds

**Orlando Richards** - 6:40:05 AM
Prior to doing the reboot for a pixstor-upgrade: 



 


systemctl stop ngenea-worker



then, if that takes too long:






 


systemctl kill ngenea-worker

**Orlando Richards** - 6:53:27 AM
To enable file system auditing:



 


mmaudit mmfs1 enable --skip-filesets .arcapix
Then:






 


tail -F /mmfs1/.audit_log/*/*latest*



will show the activity stream

**Unknown User** - 7:05:43 AM


**Unknown User** - 7:05:44 AM


**Unknown User** - 7:12:11 AM


**Gareth Tucker** - 7:14:21 AM
Orlando Richards Jez Tucker FYI, events look to be good following that latest pixstor apply

**Gareth Tucker** - 7:22:03 AM
Jez Tucker new space created called gt02 and job schedules look as follows
*Reactions: 👍*

**Gareth Tucker** - 7:59:57 AM
Orlando Richards can we repeat this to skip additional filesets and do we need to do anything before or after?


 



mmaudit mmfs1 enable --skip-filesets .arcapix

**Orlando Richards** - 8:50:34 AM
mmaudit mmfs1 update --disable-filesets .arcapix,my_other_fileset
^^ this, once auditing has been enabled

**Orlando Richards** - 8:51:04 AM
not sure if you need to include the current list in it or not

**Gareth Tucker** - 8:52:42 AM
ok, was seeing stuff like /mmfs1/.ctdb/ coming through so wanted to exclude them as well

**Gareth Tucker** - 8:53:29 AM
and /mmfs1/.policytmp

**Gareth Tucker** - 8:55:49 AM
root@ca-sn-dev-01:~ # mmaudit mmfs1 update --disable-filesets .arcapix,.ctdb,.policytmp
[E] Fileset: .ctdb does not exist within filesystem device: mmfs1
[I] Finished validating 3 filesets.
[E] One or more filesets associated with system device: mmfs1 cannot be found, are not linked or have additional problems.  Correct the problem and run mmaudit again.
mmaudit: Command failed. Examine previous error messages to determine cause
 


what did I do wrong?


 


Below is a .ctdb entry for reference


 






 


{"LWE_JSON": "0.0.5", "path": "/mmfs1/.ctdb/reclock", "clusterName": "ca-sn-dev-01.pixstor", "nodeName": "ca-sn-dev-01", "nfsClientIp": "", "fsName": "mmfs1", "event": "OPEN", "inode": "114297", "linkCount": "1", "openFlags": "32771", "poolName": "sata1", "fileSize": "0", "ownerUserId": "0", "ownerGroupId": "0", "atime": "2025-05-30_12:22:02.686+0100", "ctime": "2025-05-30_12:22:02.686+0100", "mtime": "2025-05-30_12:22:02.686+0100", "eventTime": "2025-07-28_16:53:11.869+0100", "clientUserId": "0", "clientGroupId": "0", "accessMode": null, "processId": "29880", "bytesRead": "0", "bytesWritten": "0", "minReadOffset": "9223372036854775807", "maxReadOffset": "0", "minWriteOffset": "9223372036854775807", "maxWriteOffset": "0", "permissions": "200100600", "acls": null, "xattrs": null, "subEvent": "NONE"}

**Orlando Richards** - 9:19:55 AM
there's no fileset for .ctdb

**Orlando Richards** - 9:20:01 AM
you could exclude the fileset named root

**Orlando Richards** - 9:20:08 AM
which will cover everything that's not in a fileset

**Gareth Tucker** - 10:19:23 AM
Orlando Richards FYI, this seems to cut out most of the unwanted noise


 






 


mmaudit mmfs1 update --disable-filesets .arcapix,root,.policytmp,.rotate


## 7/29/2025

**Gareth Tucker** - 1:39:50 AM
Morning All, FYI, to give our QA team some stability whilst they finish testing the R1 release and also allow Dev progress to continue on R2, we will be moving our internal Vision Dev testing to PixStor Dev 02.


 


I have updated PixStor Dev 02 to PixStor 6.10.0-0.alpha.16 and have given it a quick run through. All seems to be working OK at the moment.


 


PixStor Dev 01 should now be considered as a QA instance.


 


Any questions, please give me a shout. Thanks.
*Reactions: 👍*

**Jamie Sabino** - 9:26:19 AM
Gareth Tucker Orlando Richards, we are debugging an issue where a new bucket is created upstream from ai+, and ensuring ai+ is triggered properly.  We believe the issue is upstream, specifically around space02.  What is the official process/ mop for this on the ngenea/vision side of the house?

**Orlando Richards** - 9:27:18 AM
Probably go through Jez Tucker to triage
*Reactions: 👍*

**Jason Perr** - 9:42:41 AM
Orlando Richards any idea on why we might get this error? Is there more config we need to do to configure additional spaces to work with Vision and AI?


 


"failures":[


12 items


 


0:{


2 items


"path":


"/mmfs1/data/space02/My Honest Thoughts on the Software Engineering Job Market in 2025.mp4"


 


"message":[


1 item


0


:


"Missing field from path payload: 'additional_metadata'"


]

**Jason Perr** - 9:42:57 AM


**Jason Perr** - 9:43:03 AM
Everyone

**Gareth Tucker** - 10:00:59 AM
I think it will be the schedule, I will take a quick look

**Gareth Tucker** - 10:01:21 AM
I am assuming Jason Perr you have created a new schedule for your new space yeah?

**Jason Perr** - 10:01:26 AM
yes

**Jason Perr** - 10:02:03 AM


**Gareth Tucker** - 10:05:18 AM
ok, probably still needs to be manually patched in on the backend on the version that you have installed

**Gareth Tucker** - 10:05:33 AM
I will take a look in a moment
*Reactions: 👍*

**Jamie Sabino** - 10:07:03 AM
all good, thanks Gareth Tucker.. if it is indeed an issue upstream and / or version specific, i think we are good, we can proceed and circle back .  I would like to be able to update our version as discussed on Monday's call, atleast be part of it (if not me due to timelines, i can ensure someone is there )

**Gareth Tucker** - 10:17:45 AM
Yeah, version specific I think, I believe this step is now automated in the latest version of PixStor/Hub that we were testing yesterday. I will let Jez Tucker confirm that though.


 


In the short term, space02 should be up and running for you now. I can see MediaInfo being generated for new files and thumbnails being generated for applicable files.


 


Jamie Sabino please continue with your tests and let us know if you spot any other issues.
*Reactions: 👍*

**Gareth Tucker** - 10:26:59 AM
The workaround is detailed if you scroll down to points 4 and 5 on the following doc if you need to refer back again short term


 


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4343562246/Cardiff+Lab+Ngenea+Hub+6.10.0-0.alpha.13+Update+Guidance#Space-Creation


 


To fix your new schedule, I ran the following on the PixStor node once I had determined the schedule ID, which was 3 on this occasion


 


 



 


ngcurl patch schedules/3 '{"discovery_options": {"condense_moves": false, "extra_fields": ["inode", "generation"]}}'
*Reactions: 👍*

**Jamie Sabino** - 10:29:29 AM
thanks  Gareth Tucker.. awesome
*Reactions: 👍*


## 7/30/2025

**Jamie Sabino** - 8:15:25 AM
Gareth Tucker or Orlando Richards , I'm looking for the GPU node we are targeting for aiplus in Cardiff, i see the following page with reference to AI+ Service at ip 10.60.0.179, is this correct? Currently its not reachable, so just confirming. https://arcapix.atlassian.net/wiki/spaces/ORDOCS/pages/4828135430/VizHub+-+Demo+integration+of+PixStor+Ngenea+Vision+AI+and+Swarm+-+Demo+System+Reference

**Gareth Tucker** - 8:21:57 AM
Hi Jamie Sabino that is actually High Wycombe that you have linked there

**Gareth Tucker** - 8:22:14 AM
will point you in the right direction shortly

**Gareth Tucker** - 8:23:08 AM
FYI, both FTL instances of Iris are now up-to-date on the Vision components
*Reactions: 👍*

**Gareth Tucker** - 8:26:38 AM
Cardiff AI+ server details are in 1password here


 


https://start.1password.com/open/i?a=WLJKONA755A55BVPQ45H22MWAI&v=3gtxnd427tybzjdlwplqs3chii&i=lggxlve23iz6u3gowqyv5jhpza&h=my.1password.com

**Jamie Sabino** - 9:01:48 AM
thanks Gareth Tucker.

**Jamie Sabino** - 9:03:47 AM
Everyone please let me know if there is absolutely any objection to fully rebuilding this ai+ server in cardiff, my assumption is no given what i see running on it ..  likely target overnight  ...

**Jason Perr** - 9:16:09 AM
I think it makes sense.

**Jason Perr** - 9:16:31 AM
Should be a good testing ground for Terraform and the installer

**Gareth Tucker** - 9:39:32 AM
Jamie Sabino all good from our side. If the access credentials change at all as part of the rebuild, please let us know so that we can update our own internal documentation.
*Reactions: 👍*

**Jamie Sabino** - 2:32:35 PM
Gareth Tucker Orlando Richards cardiff ai+ node is in the process of being setup, we were successfully able to deploy the required infrastructure required (thankfully it survived a reboot ).  Overnight, Ankit Josh(IC) and Arunita will start the installation and configuration and hopefully by your morning its ready to go.  As for FTL, we are good on the Vision version, will be good with the ai+ GA release for the morning as well, pending the pixstore upgrade from Orlando Richards and/or team, we should be in a good spot to finish strong.
*Reactions: 👍, 👍*

**Jamie Sabino** - 7:34:03 PM
Gareth Tucker or Orlando Richards , just want to confirm the exact which Vision/Iris node we want this to be connected to.   In this link here https://perifery.atlassian.net/wiki/spaces/MCS/pages/4343562246/Cardiff+Lab+Ngenea+Hub+6.10.0-0.alpha.13+Update+Guidance#Vision-Install, it appears to be https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4957011980/ca-sn-dev-02+10.20.0.162, All we really need is to confirm the IP for NFS mounting and some integration testing and rabbit configuration as Jessica has documented here for FTL: https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4998135809/ftl-dev-sn-01+10.161.244.101.   (Arunita sahu(IC) Ankit Josh(IC) fyi ^, when you get to that point in the installation of ai+) ,
*Reactions: 👍, 👍*


## 7/31/2025

**Gareth Tucker** - 1:29:00 AM
Jamie Sabino the Cardiff Iris nodes are documented in a couple of places at the moment.


 


Jessica's install notes which are in a similar format to the FTL notes are here


 


https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4957011969/ca-sn-dev-01+10.20.0.160


https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4957011980/ca-sn-dev-02+10.20.0.162


 


and the OM internal notes on the same topic are here which include the RabbitMQ details


 


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4297818165/Pixstor+dev+deployment+at+OM


 


IP's you need for NFS are on both.

**Gareth Tucker** - 1:31:55 AM
The primary QA instance is 10.20.0.160 which would be the priority to set up first, but ultimately we'd like to have them both configured if possible.

**Orlando Richards** - 3:51:14 AM
Hey Gareth Tucker - any update on that user creation script?

**Gareth Tucker** - 4:29:41 AM
Next on Polly's list Orlando, additional users post install will still need to be set up manually at the moment

**Jamie Sabino** - 6:27:46 AM
Everyone, folks need some assistance setting up the NFS server on the pixstore side of the house.. looks like NFS is managed differently here.. 



base) perifery@cardiff-ai:/$ sudo mount -t nfs 10.20.0.160:/mmfs1 /mmfs1

Created symlink /run/systemd/system/remote-fs.target.wants/rpc-statd.service → /lib/systemd/system/rpc-statd.service.

mount.nfs: mounting 10.20.0.160:/mmfs1 failed, reason given by server: No such file or directory

(base) perifery@cardiff-ai:/$ showmount -e 10.20.0.160

Export list for 10.20.0.160:



Is there a doc on your end on how to address this? this is a requirement for ai+, currently that's our instruction.. i'm fumbling around this pixstore node, and don't want to change things that i don't know what the  purpose or what it might impact..

**Orlando Richards** - 6:28:26 AM
i suspect you need to configure the NFS share via Hub

**Jamie Sabino** - 6:29:42 AM
Jez Tucker ^ what are the steps you did on your end to fix this on FTL ?

**Orlando Richards** - 6:34:23 AM
Hey Jamie Sabino - check out : https://arcapix.atlassian.net/wiki/spaces/SG/pages/4911301036/Ngenea+Hub+-+Shares

**Jez Tucker** - 6:39:00 AM
Jamie Sabino would you like some assistance?

**Jez Tucker** - 6:39:41 AM
if you could do me as the AI+ user:






 


id

**Jamie Sabino** - 6:49:44 AM
Jez Tucker yes, would be good, i don't want to muck things up at the final hour

**Jez Tucker** - 6:50:07 AM
ok. I'll call you

**Barry Evans** - 8:42:36 AM
just thinking, Gareth Tucker Daniel Iwan while hub is going to processes space02 and put stuff on the queue, i imagine vision is still going to be gummed up for ages doing proxies so anything that gets dumped into space02 isn't going to show up for awhile

**Barry Evans** - 8:42:47 AM
which means, I probably need to nuke "the queue"

**Barry Evans** - 8:43:04 AM
any quick way of doing this?

**Barry Evans** - 8:43:39 AM
brutality is just fine

**Daniel Iwan** - 8:44:58 AM
yeah, all will be pilled up. You can Purge the queue directly in Rabbit if there is anything there.

**Daniel Iwan** - 8:46:13 AM
proxygen keeps its own database of files to process however already picked up from the queue. I'll check how to trim that

**Barry Evans** - 9:05:57 AM
Jason Perr the vision login will have likely changed - it is now: admin-5675/edison2

**Daniel Iwan** - 9:16:29 AM
looks like everything that appeared in Rabbit will be in proxygen database. We can manually SQL clear everything if needed.

*Attachments:*
- messageReference

**Barry Evans** - 9:19:01 AM
it's ok - let's see where we get to
*Reactions: 👍*

**Jason Perr** - 9:47:25 AM
Everyone We are trying to setup AI+ at Alt Systems. At the moment if we log into Vision we see this:


|

**Jason Perr** - 9:47:39 AM
Barry Evans or Gareth Tucker any ideas on this?

**Gareth Tucker** - 9:50:06 AM
Looks like Versity GW is down, will grab you the restart notes now

**Gareth Tucker** - 9:51:06 AM
https://perifery.atlassian.net/wiki/spaces/MCS/pages/4297818165/Pixstor+dev+deployment+at+OM#How-to-check-the-status-of-the-Versity-S3-gateway

**Jez Tucker** - 9:52:19 AM
have done it
*Reactions: 👍*

**Jez Tucker** - 9:52:39 AM
but yes, ^^ use that procedure.


gareth: too many open files again
*Reactions: 👍*


## 8/1/2025

**Barry Evans** - 2:28:43 AM
Jason Perr

**Barry Evans** - 2:28:50 AM


**Barry Evans** - 11:15:34 AM
Jason Perr does this apply only to that directory?

**Justin Toribio** - 12:04:54 PM
Barry Evans yes, currently only that directory (and any sub-directories of it) are configured, but any new directory you want can be configured in the AI+ admin UI, like in that video Jason shared...

*Attachments:*
- messageReference

**Justin Toribio** - 12:05:10 PM
Please let me know if you'd like any help with that

**Barry Evans** - 12:06:47 PM
sure Justin Toribio can you point me in the direction of that video

**Barry Evans** - 12:07:07 PM
so many channels....

**Justin Toribio** - 12:08:32 PM
Lol, yep, it was in the Florida Testing env channel...

**Justin Toribio** - 12:08:33 PM
Recap: Florida Testing environment setup - Sync  July 23 | Meeting | Microsoft Teams

**Justin Toribio** - 12:08:58 PM
You'll want to watch Part 2
*Reactions: 👍*

**Justin Toribio** - 12:13:25 PM
Please ping me if you get stuck on anything


## 8/4/2025

**Unknown User** - 6:00:37 AM


**Unknown User** - 6:00:46 AM


**Barry Evans** - 6:01:35 AM
Running behind 5
*Reactions: 👍*

**Unknown User** - 6:11:21 AM


**Unknown User** - 6:11:23 AM


**Unknown User** - 6:12:13 AM


**Barry Evans** - 8:23:15 AM
Im in a good place. Couple of (potential) outliers that could be because of no audio, or crazy tracks, but outside of that all is doing what it should be doing
*Reactions: 👍*

**Barry Evans** - 8:25:48 AM
the audio on some of these clips are absolutely terrible and Metagen is helping to make heads/tails of it, which is cool

**Erik Salter** - 8:26:14 AM
Oh, I can fix that =)


## 8/5/2025

**Polly Miller** - 2:36:22 AM
Morning Orlando Richards - there is now a script for creating keycloak users, see https://perifery.atlassian.net/wiki/spaces/MCS/pages/4305059912/Keycloak+provisioning+via+curl


I've also attached the script here

*Attachments:*
- create_keycloak_user.sh
*Reactions: ❤️*

**Barry Evans** - 2:56:03 AM
Looks like the GPU node in the Alt lab has exploded

**Barry Evans** - 2:56:58 AM
(by that i mean, it is no longer online)

**Barry Evans** - 3:02:16 AM
looks like 2:24 local time

**Barry Evans** - 3:02:43 AM
which is a few minutes after i kicked off a big ingest

**Orlando Richards** - 4:21:10 AM
Daniel Iwan - i've just spotted that the installer is doing pip install nowadays for virtualenv setup. That'll not work where the customer doesn't have internet access from the Vision node. We'll need to take a look at how to handle these for RC2

**Daniel Iwan** - 4:27:44 AM
yes, it does. Is the dependencies or setting up venv that will be the problem? Or both?

**Daniel Iwan** - 4:42:38 AM
I think it's the hvac in requirements.txt that will be the problem. I could probably download it and transitive deps but that is platform and Python specific as far as I know

**Iva Kalova** - 6:07:30 AM
Barry Evans, is install of IRIS without internet connection a requirement for the release in September?

**Orlando Richards** - 6:55:17 AM
Hey Polly Miller - doyou know where I can get a username/password from for Keycloak? I've got the "Master admin credentials" in the vision installer, and also in /var/lib/pixstor/iris/mcs-runtime/mcs-core/keycloak/secrets/keycloak.master.*  - but I get a "401 Unauthorized" error when running the script - specifically on this bit:


 






 


# curl -s https://devpx6-orichards-opensearch-rc-560-1:8443/realms/iris/protocol/openid-connect/token --header Content-Type:application/x-www-form-urlencoded --data-urlencode grant_type=password --data-urlencode client_id=admin-cli --data-urlencode username=9nyzX8Hb --data-urlencode password=PEcWILS5RUhHzvpY | jq
{
  "error": "invalid_grant",
  "error_description": "Invalid user credentials"
}

*Attachments:*
- messageReference

**Orlando Richards** - 6:56:47 AM
Ahh - i see - i should use the admin username/password for the initial user, not the "keycloak master" username/pass

**Orlando Richards** - 6:59:21 AM
Still having trouble - I'll ping you a DM

**Unknown User** - 8:19:54 AM


**Jamie Sabino** - 8:20:45 AM
Barry Evans regarding the GPU node at Alt, looking into that.

**Barry Evans** - 8:27:57 AM
Jamie Sabino - not sure if it's on idrac or not - let us know if you need me to find someone to press buttons

**Jamie Sabino** - 8:28:54 AM
Barry Evans that's exactly what i'm searching docs for, I canvassed the team, might be best to shoot me a contact.  Do we engage with them at all on teams/slack etc?

**Barry Evans** - 8:29:39 AM
nah they are weird about that, they prefer cans attached with strings

**Barry Evans** - 8:29:47 AM
i'll shoot a mail out
*Reactions: 👍*

**Barry Evans** - 8:31:55 AM
Iva Kalova - highly desirable. Not mandatory, but not far from it

**Barry Evans** - 8:33:11 AM
most customers "wont" provide the access rather than "cant" so where they "wont" we just tell them they have to. But we will eventually hit a "cant" and then we are stuffed. so it's something we'll need sorting
*Reactions: 👍*

**Iva Kalova** - 9:14:11 AM
Barry Evans We need to update the release milestones for R1 GA in the spreadsheet. Currently it says code complete on Aug 30. Is this still the plan?

**Barry Evans** - 11:13:54 AM
Jamie Sabino how do you get to the Alt lab, remind me? (there is more than one way so just double checking)

**Barry Evans** - 11:16:57 AM
it iwll be either wireguard or openvpn

**Jamie Sabino** - 11:17:11 AM
wireguard

**Jamie Sabino** - 11:17:23 AM
wireguard

**Barry Evans** - 11:17:48 AM
k, are you able to hit 192.168.18.10

**Barry Evans** - 11:17:56 AM
u: root p: edison2

**Jamie Sabino** - 11:18:06 AM
let me switch vpns.

**Jamie Sabino** - 11:19:05 AM
able to hit, and login

**Barry Evans** - 11:19:16 AM
perfect - from there - 10.100.0.11

**Barry Evans** - 11:19:22 AM
should tkae you straight in

**Jamie Sabino** - 11:20:43 AM
(just reading the email, ok, let me poke )
*Reactions: 👍*

**Jamie Sabino** - 2:02:49 PM
Barry Evans, et al, we have root caused the AI+ Alt gpu node to a kernel panic, and clearly it did not survive the reboot (lots of work here in this area).  I'm still waiting on ALT to look at their gateway to see why our node can't access it, once that is resolved, We'll turn the services back up and validate it end to end (and document the process). That said, when you say you kicked off a big ingest, what do you mean? What was the specific configuration or testing?  I see some driver issues behind it, but it appears to be just noise.

**Barry Evans** - 2:16:58 PM
Thanks Jamie Sabino - they are tied up in a nasty escalation - I can see the emails, will have a look in the morning and see if I can massage through

**Barry Evans** - 2:17:50 PM
in the end, FWIW, that IP is not necessary for the everyday and we should probably conf against the 10.100.0.0/24 range if not already. But I won't complicate it, will see about getting that sorted

**Barry Evans** - 2:18:07 PM
when I sa

**Barry Evans** - 2:20:55 PM
sorry when I say I kicked off a full ingest, I have AI+ pointed at a folder at space01/Footage, which contains a 5 digit number of files

**Barry Evans** - 2:21:09 PM
they have already been processed and their metadata is there

**Barry Evans** - 2:21:24 PM
but I removed the proxies and told ngenea to "start over"

**Barry Evans** - 2:21:34 PM
so it would have put all of those files back on the queue

**Barry Evans** - 2:22:23 PM
so, it was essentially an ingest test of approx 20K files

**Barry Evans** - 2:22:55 PM
mixture of prores and JPEG2K MXFs, mp4s and exrs

**Jamie Sabino** - 2:23:18 PM
thanks Barry Evans ^  i don't believe what you did triggered this.  As for the address changes, i hear you.  Let's see if they respond.. my hope is just turning the services back on things just work, we'll have to change some configurations otherwise.

**Barry Evans** - 2:24:26 PM
demo wise we are good, we've got all the base stuff - it worked. Will want to expand the prompts and add new material, but this is not for tonight. I'll see if I can work out the network in the AM so that no one has to make any sweeping changes

**Barry Evans** - 2:24:44 PM
for now - nothing pressing is blocked and im glad the server is back up and accessible
*Reactions: 👍*


## 8/6/2025

**Jez Tucker** - 1:48:14 AM
Gareth Tucker the pixstor GA with Iris R1 in is building.


This also contains the exiftool capability.


Which node(s) could we bump up on cardiff so we can see if exiftool works for you.

**Gareth Tucker** - 2:01:52 AM
Fantastic, PixStor Dev 02 please Jez Tucker

**Jez Tucker** - 2:03:29 AM
Cool. We'll schedule that once we've done an internal upgrade or two this end.  Prob today/tomorrow.
*Reactions: 👍*

**Barry Evans** - 7:41:21 AM
Hey everybody

**Barry Evans** - 7:41:21 AM
the management node is going for a reboot

**Barry Evans** - 7:41:22 AM
Jamie Sabino that ip is now set and contactable

**Barry Evans** - 7:41:48 AM
just need to figure out which flavor of network manager to use to make it stick now

**Jamie Sabino** - 8:11:11 AM
Barry Evans yes , we are using network manager, they had this setup with systemd.

**Barry Evans** - 8:12:02 AM
cool - for the record, it looks like the interface was enp37s0f1 rather than enp1s0

**Jamie Sabino** - 8:12:11 AM
i created the entry so that on reboot systemd recovers with proper ip (that was one of the reasons for the 7 hour outage on this server).. I'll be adding some tooling for kernel crashes/ tracing..

**Barry Evans** - 8:12:22 AM
not sure what that other one was about

**Jamie Sabino** - 8:12:43 AM
probably why i saw 2 profiles.. but no history and it was missing some key configurations for it to recover.

**Jamie Sabino** - 8:13:46 AM
let me log back in and validate everything is running .. need to document this and figure out what we need to automatically spin up the services again.. i'll keep you posted

**Barry Evans** - 8:15:20 AM
cool - let me know - have some new content we can test with

**Jamie Sabino** - 8:17:56 AM
will do, apologies if i'm going a little slow here, this is a real scenario that is uncovering alot of items .. (also this vision versity GW issue is popping up everywhere )..

**Jamie Sabino** - 8:18:15 AM
want to get as much as possible off this

**Barry Evans** - 8:25:21 AM
no this is good, take your time

**Barry Evans** - 8:25:34 AM
We have good news on the versity gw issue

**Barry Evans** - 8:25:54 AM
(as in, we have it fixed)

**Barry Evans** - 8:28:15 AM
it was for sure a software issue rather than config so the "other" labs will need the RPM/update

**Jamie Sabino** - 8:29:07 AM
cool, , i need the fix for FTL .. right now, its looking like ALT blew away configurations, (i do have a backup), but i want to understand this.. so its going to be a bit of time here.. i'll keep you posted.. likely end of day (but hoping our restore works , never been tested )

**Barry Evans** - 8:30:42 AM
really as in the AI+ configurations or the network configuration?

**Erik Salter** - 8:30:45 AM
So why did the kernel panic again?

**Orlando Richards** - 9:20:06 AM
Because it couldn’t handle the truth page fault.


 


Thanks, ChatGPT.

*Attachments:*
- messageReference

**Jamie Sabino** - 9:28:21 AM
page fault triggered 



Aug 05 02:24:14 per-ai kernel: #PF: supervisor write access in kernel mode


Aug 05 02:24:14 per-ai kernel: BUG: unable to handle page fault for address: ffff98a050bf8000


 



from dmesh we see the reboot at:



[Tue Aug  5 09:49:24 2025] Booting paravirtualized kernel on bare hardware



Currently being tracked with https://perifery.atlassian.net/browse/AI-915 , need some OS changes here to persist these logs, and handle the 7 hour wait when it was hosed.

**Jamie Sabino** - 10:25:29 AM
Barry Evans et al, AI+ node is back in service, we performed a couple e2e tests, made some changes to persist and survive a crash .  We'll test this locally in parallel.

**Barry Evans** - 10:55:35 AM
thanks Jamie Sabino!

**Barry Evans** - 10:55:46 AM
Going to unleash a fresh ingest
*Reactions: 👍*

**Jamie Sabino** - 11:20:55 AM
I wouldn’t be against you trying to do the exact same thing you did last time Barry Evans, I’m pretty sure it wasn’t related, but have some more things in place to rca further if it happens again

**Barry Evans** - 11:21:24 AM
no problem - that has started now

**Barry Evans** - 11:21:30 AM
as in, 5 minutes ago

**Barry Evans** - 11:21:37 AM
proxies are just starting to generate

**Barry Evans** - 11:22:09 AM
we are keying off the proxies right now for T+S, is that correct?

**Jamie Sabino** - 11:22:13 AM
And please keep in mind, we have had no load testing at all

**Barry Evans** - 11:22:21 AM
you do now

**Jamie Sabino** - 11:22:45 AM
Yep! And it’s good.

**Barry Evans** - 11:23:09 AM
it's all good jamie shit happens and more shit will happen, good to have it all together to get the demons gone

**Jamie Sabino** - 11:23:10 AM
I’m not sure what you mean by the proxies. You mean trigger for T&S?

**Barry Evans** - 11:24:21 AM
i mean, are we looking at the original source content for T&S/metagen, or are we using the proxies generated by vision

**Barry Evans** - 11:25:37 AM
it's cool - I can see things happening on both vision and AI

**Jamie Sabino** - 11:25:40 AM
I can’t answer that properly sorry.. still digging in one layer at a time.

**Barry Evans** - 11:25:59 AM
which means it's burboun time - will check back in later

**Jamie Sabino** - 11:26:30 AM
But I want to understand that.. proxies etc further. Enjoy the burboun!

**Justin Toribio** - 11:34:13 AM
Barry Evans T&S processes the media files that get stored at /mmfs1/data/space01.  Please correct me if I'm mistaken, but I believe those are the source files, and the proxies are smaller versions of the files that are used for the thumbnail, faster playback and scrubbing etc...  But I don't know where those proxies get stored and I'd like to understand them better myself as well.

*Attachments:*
- messageReference
*Reactions: 👍*

**Gareth Tucker** - 11:36:11 AM
Source content Barry

*Attachments:*
- messageReference

**Barry Evans** - 11:36:37 AM
Ok cool


## 8/7/2025

**Barry Evans** - 3:06:55 AM
last night went well

**Barry Evans** - 3:07:15 AM
I kicked off another ingest this morning and the AI+ server has crashed again

**Barry Evans** - 3:08:12 AM
sorry to be specific - it is no longer contactable on any interface at a minimum

**Barry Evans** - 3:22:47 AM
things to note, I added a few additional prompts prior to the ingest to space01/Footage. Just a datapoint in case it is useful

**Jez Tucker** - 3:27:19 AM
Daniel Iwan cardiff 02 is upgraded
*Reactions: 👍, 👍*

**Barry Evans** - 4:04:45 AM
Everyone - I am going to set the announce and training session for Operations and SA's for 8am-10am PST/4pm-6pm on Thursday 21st August

**Barry Evans** - 4:05:20 AM
There are endless corporate meeting clashes and vacations competing, but this is the "least shit" time

**Barry Evans** - 4:05:51 AM
I will get the invites out now

**Jez Tucker** - 4:23:47 AM
Note to all, this is a new IRIS R2 page I have started, still in flight.


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4394385421/IRIS+R2+Development+Musings
*Reactions: 👍*

**Barry Evans** - 4:26:08 AM
wrote out the agenda... it's two days worth....

**Barry Evans** - 4:26:14 AM
as in two sessions worth

**Barry Evans** - 4:26:21 AM
so make that Aug 20th and 21st

**Jez Tucker** - 4:41:36 AM
well, something fired on cardiff-02 for file Space01/Hockey_512kbit.mp4


 



 


dynamo.tasks.iris.exiftool[9fbb035e-4460-4c57-a29e-a54dcd1b6fa4] [x] Sent to vision-metadata-xchg -> {'eventTime': '2025-08-07T11:39:46.080Z',
*Reactions: 👍*

**Gareth Tucker** - 4:46:20 AM
Doesn't look like we have debug queues on 02 yet, will add some

**Jez Tucker** - 4:53:16 AM
cool. I seem to have hit that odd cert issue on 02, at least from my side. trying to work out if it's my issue (socks proxying..), or general.


is the vision UI operational on 02 ?

**Jez Tucker** - 4:54:48 AM
or do you see a white screen with cert error in the browser debug console ?

**Jez Tucker** - 4:55:06 AM
(but also, very much lunchtime..!)

**Gareth Tucker** - 4:55:44 AM
yes, it is for me

**Jez Tucker** - 4:56:09 AM
cool. I'll fix my access post lunch and go hunting for exifinfo in files then

**Gareth Tucker** - 4:56:11 AM
cert for Vision is same cert as Versity, so you should only have to accept once

**Gareth Tucker** - 4:56:33 AM
FYI, just dropped an image, this was the result

**Gareth Tucker** - 4:57:00 AM
Should be good for David Bridger to take a closer look from our side now.

**Jez Tucker** - 4:57:28 AM
ok. let me know when you would like 01 also brought up to current
*Reactions: 👍*

**Jamie Sabino** - 5:19:00 AM
Barry Evans ack on the crash again at ALT. Are you able to do the same thing on Cardiff? That environment should be fully updated now . Would be good to reproduce this in house.

**Gareth Tucker** - 5:21:44 AM
Jamie Sabino is Cardiff configured for use now following the update?

**Jamie Sabino** - 5:46:07 AM
Not sure what update you are talking about. But yesterday my morning Arunita confirmed it was working

**Jamie Sabino** - 5:46:33 AM
I was focused on ALt yesterday and will be again today it appears

**Gareth Tucker** - 5:51:24 AM
OK, I haven't heard any news on the Cardiff set up since the end of last week. If it is working, do we know what spaces / folders it is configured to watch so that we can let QA from our side loose on it?

**Jamie Sabino** - 5:53:25 AM
I will follow up personally this morning.  It was done the next day for the Friday, but i was off, maybe someone didn't communicate that.

**Gareth Tucker** - 5:54:04 AM
ok, thanks Jamie

**Arunita sahu(IC)** - 6:31:36 AM
Hi Gareth Tucker it's working, you can use space01 on Cardiff Dev 01.

*Attachments:*
- messageReference
*Reactions: 👍*

**Jamie Sabino** - 6:34:01 AM
thanks Arunita sahu(IC) for confirming.  Would be good to simulate Barry's test here in Cardiff Gareth Tucker

**David Bridger** - 7:23:43 AM
Hi Jez Tucker. I've taken a look at the exiftool messages. We're receiving messages fine, that's all good. Right now there's only 2 changes I can see that need to be addressed. 



Change appId ngeneahub/exif to ngeneahub/exiftool as exiftool extracts more than just exif metadata. The output is also specific to exiftool i.e. not a standard schema.Data is currently flat and unstructured, mixing all metadata into one category. The best approach is to enable group headings which groups metadata together under their own headings e.g. EXIF, XMP, Photoshop. e.g.

exiftool -json -groupHeadings <file_path>

**David Bridger** - 7:24:36 AM
I've detailed this more clearly here https://perifery.atlassian.net/wiki/spaces/MCS/pages/4394876929/Exiftool+Metadata+Integration

**Jez Tucker** - 7:54:43 AM
thanks. I'll ticket these up
*Reactions: 👍*

**Jez Tucker** - 10:17:07 AM
Done and should be ready for testing on Monday's integration call

**Gareth Tucker** - 10:19:33 AM
Cool, David's side won't be ready by then but we can make sure that all looks ready to go

**Gareth Tucker** - 10:20:07 AM
Have some questions on display which we can review at the same time


## 8/8/2025

**Orlando Richards** - 1:14:55 AM
I have a potential route forward to hosting VersityS3 behind a single proxy, with the other components (vision, hub, etc) using baseurls and versity without (since the client key signing does not work with that), using Nginx to parse the request headers and proxy based on them. 


 


For the other applications (mainly all of Vision's accessible components) - what is the scope for putting them behind a baseurl in a proxy?

**Gareth Tucker** - 1:25:14 AM
It's on our would like to do list Orlando as it simplifies things like CORS and SSL but we have not attempted to try it yet to see if there are any complications

**Orlando Richards** - 1:35:15 AM
My overall goal is to get everything behind port 443 on the main pixstor web server, which will allow everything to work nicely with CORS, including cross-application api calls once we have the single sign on done.

**Gareth Tucker** - 1:36:51 AM
Indeed, that would be our wish too

**Orlando Richards** - 1:37:33 AM
i'll see if i can have a go at the idea i have for VersityGW - that's likely to be the main blocker if it doesn't work out
*Reactions: 👍*

**Orlando Richards** - 2:17:19 AM
Is it possible to change the URL for the S3 endpoint after deployment? I want to change my :7070 to :443, but it's not in any of the plain text config files in the deployment

**Orlando Richards** - 2:26:56 AM
Success via the AWS CLI!

*Attachments:*
- messageReference

**Daniel Iwan** - 2:34:34 AM
fyi Orlando Richards we are slowly moving away from environment.properties file to storing config in Vault.


Any changes to the file may no longer take the effect in some services.

**Orlando Richards** - 2:40:57 AM
any idea how I can change that port in vault?

**Daniel Iwan** - 2:50:46 AM
via GUI: it will be in path https://10.20.0.161:8200/ui/vault/secrets/mcs-config/kv/common%2Ftenants%2Firis/details


for command line either Vault REST API https://developer.hashicorp.com/vault/api-docs/secret/kv/kv-v2#create-update-secret


or using our vman utility 


Using something like



 


./scripts/vman.sh storage list
./scripts/vman.sh storage get --name ngenea
./scripts/vman.sh storage remove --name ngenea
./scripts/vman.sh storage add --json-file my-new-storage.json
Currently only mcs-mapi is relying on that info and needs to be restarted post-change


Some details


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4289593349/Configuration+of+services+in+Hashicorp+Vault


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4278356510/MCS-1289+-+Configurable+proxy+storage+location

**Orlando Richards** - 2:52:41 AM
took a different route, and just wiped + redeployed, and now have it working behind the "core" nginx proxy on port 443 for S3 calls from Vision!

**Orlando Richards** - 2:54:00 AM
This is good news Daniel Iwan Gareth Tucker! Should now "just" be a case of putting in a baseurl support to the Vision components, including Keycloak, etc, and we can get everything behind port 443
*Reactions: ❤️*

**Daniel Iwan** - 2:58:38 AM
good stuff, or alternatively rewrite in nginx for now?

**Orlando Richards** - 3:02:09 AM
ooh - hadn't thought about that - you got any samples of doing that for vision?

**Daniel Iwan** - 3:04:20 AM
not really, sorry. That was in the todo list only

**Orlando Richards** - 5:02:37 AM
PR for this:


 


https://bitbucket.org/arcapix/pixstor/pull-requests/3112/overview


 


Should be able to make this "backwards compatible" with existing deployments

*Attachments:*
- messageReference

**Gareth Tucker** - 9:25:53 AM
Hi Erik Salter were you able to generate a transcription output example for us yesterday that we can review?

**Erik Salter** - 9:29:11 AM
It'll look something like this:

*Attachments:*
- transcription_sample.txt.zip
*Reactions: 👍, 👍, 👍*

**Gareth Tucker** - 9:30:06 AM
Cheers Erik, we'll take a look


## 8/11/2025

**Gareth Tucker** - 5:01:53 AM
Hi Erik Salter, thinking ahead here to help with some current decisions. When we start to use MetaGen instead of T&S for summary and keyword generation, will we still get a T&S message when there is a transcription, our would this be bundled into the MetaGen message like the T&S example that you supplied?

**Unknown User** - 5:59:45 AM


**Unknown User** - 5:59:54 AM


**Erik Salter** - 6:03:02 AM
Whatever works.  My preference is to send a single message because we can compress payloads, but we can work around Vision limitations if need be.
*Reactions: 👍*

**Unknown User** - 6:49:47 AM


**Unknown User** - 6:49:49 AM


**Unknown User** - 6:51:58 AM


**Barry Evans** - 7:00:50 AM
Jamie Sabino you should have a mail from a wonderful person named Alex Giles with Wycombe VPN certs

**Jamie Sabino** - 7:16:07 AM
already did!

**Barry Evans** - 7:16:29 AM
perfection

**Jamie Sabino** - 8:09:30 AM
Everyone, we'll be working on the Wycombe AI+ node upgrade and configuration today.  I don't believe it is being used at all considering the age, but just an fyi.  I'll report back when completed, and hopefully Barry can reproduce the issue we are seeing at Alt internally.
*Reactions: 👍*


## 8/12/2025

**Daniel Iwan** - 4:16:48 AM
Hi Erik Salter 


We've updated our doc with the details of Vision-AI-Plus integration, specifically messaging for Summarize process, see here

https://perifery.atlassian.net/wiki/spaces/MCS/pages/4275503112/Vision+Metadata+Integration+using+RabbitMQ#Summarize


 


This is based on your example file.

Some notes

- we've cleanup some prompts leaking into the output, probably just a setup issue

- removed newlines ets

- removed "words" element to slim down the payload. On longer vides it would bloat it to MBs adn we are not planning to use it in the near future


 


Question about multi-language support.

If multi-lang was supported do you see it as part of the same RMQ message or something completely new?

Thinking about future-proofing "Transcription" section in that JSON
*Reactions: 👍*

**Erik Salter** - 5:04:00 AM
We support word-level timestamps because it is required for certain MAM integrations.  As for transcriptions in other languages, there's no metadata differences.  It's all UTF-8 to us.

**Daniel Iwan** - 5:06:03 AM
sure. Is it straightforward to skip "words" in payload sent to Vision ?

**Erik Salter** - 5:11:31 AM
If you want.

**Daniel Iwan** - 5:12:04 AM
ok, let's do that

**Daniel Iwan** - 7:06:48 AM
regarding lang, I was thinking about multi-track audio where there is EN, ES etc. I'm assuming those would be processed separately and send as individual messages? Or would it be somehow part of one message? Looks like atm there is no room for another lang in the payload

**Erik Salter** - 7:08:37 AM
Currently, we're not handling multi-track audio in a file.  This is a simple enhancement on my part, but it's not something currently we support.
*Reactions: 👍*

**Unknown User** - 9:13:32 AM


**Gareth Tucker** - 9:23:49 AM
Jamie Sabino Arunita sahu(IC) Ankit Josh(IC) were any changes made on the Cardiff AI+ server yesterday (10.20.1.73)?


 


From docker ps it looks like the Notification API was restarted yesterday


 





 


and it doesn't look to be processing events anymore, they are just backing up and look to be expiring after 24 hours based on the queue config


 





 


Our QA team are getting no AI+ metadata for new objects at the moment.

**Jamie Sabino** - 9:24:18 AM
Gareth Tucker i'll have a look
*Reactions: 👍*

**Jamie Sabino** - 9:29:44 AM
it appears someone upgraded the Ai+Admin gui and we lost some configurations

**Jamie Sabino** - 9:30:06 AM
i'll need a few hours..

**Gareth Tucker** - 9:32:14 AM
ok, I will inform QA

**Gareth Tucker** - 9:32:31 AM
they will be wrapping up for the day shortly so in your own time Jamie
*Reactions: 👍*

**Ankit Josh(IC)** - 9:40:18 AM
Haven't used the cardiff server for the last few days.

*Attachments:*
- messageReference
*Reactions: 👍*

**Arunita sahu(IC)** - 9:40:56 AM
Yes, me too.

*Attachments:*
- messageReference
*Reactions: 👍*

**Jamie Sabino** - 12:55:39 PM
Gareth Tucker , it's back up and running.  I did see some funky errors on transcription, my assumption there is some testing going on around this.


 



{   "jobs": {     "aa56de05-b471-4630-a24d-df3cac68b618": "Finished",     "5e4ed396-309d-41ec-a413-97521df62b30": "Finished",     "4f080634-f6c4-47fc-8fef-cf3863cf852d": "Finished",     "10df935c-af87-4caf-aaee-a5cb5cfe623c": "Finished",     "b9e259d4-7fea-48fe-afb2-29fc521ebb07": "Finished",     "f53158a9-f989-4c37-80a9-00c317e24f19": "Failed",     "901720e5-452e-414b-a7c4-847397486ab7": "Finished",     "ef43a0f6-e70b-4b2c-a449-f4f1af6ae8bc": "Finished",     "21186391-175d-44f0-a55d-2ce56d52054d": "Finished",     "7238d6cf-1c96-4e71-9495-c1503d042169": "Failed",     "f9ff42c1-7b07-40df-82a4-f79498573ce7": "Finished",     "9c09b133-bd94-45c7-b3cc-29b2368beec8": "Finished",     "85fe64c4-b76f-40b3-b8b9-89f5b2090cfa": "Finished",     "0ba98367-b7da-403c-a354-a532657c9c34": "Finished",     "840efad6-fffa-4452-a0d7-8bd96ce122e9": "Finished",     "b25e7f8e-99c9-422c-bbe5-2ad2e84e8cac": "Finished",     "fe047e93-f565-4775-88e6-ead8d9334915": "Finished",     "96b16c94-b4f0-4080-a3c2-68147a51af63": "Finished",     "1bb9fbd3-c4d7-4daa-a8b0-0eba1136a5f1": "Failed",     "6980598a-58d1-452a-a232-19d274862cad": "Finished",     "732859ce-f7bc-4ddb-a819-988571a8a8fb": "Finished",     "eea091d8-dce3-4305-9c91-b6754c040f3e": "Finished",     "c455432c-1719-4d8a-b53c-7efaecd668ed": "Finished",     "7fcf12ee-4261-409a-8538-e4ba64f4e08d": "Finished",     "00714243-eed1-47d6-ba7e-2c07a4a9ab10": "Finished",     "e20e0984-979f-4f63-9e01-89fe7652a0e8": "Finished",     "3520749d-ee0b-409e-98b3-579bffa4cf6e": "Finished",     "527e8c86-4e2c-4b97-b3bf-4d2a52b9fcea": "Finished",     "f869a5e4-242d-4aab-aa6a-3981bc5b38c4": "Finished",     "264cb998-f182-4cbb-9115-a0213a771fd1": "Finished",     "a00e0adb-03ec-4ff3-860b-82a71dcb3f4b": "Finished"   },   "summary": {     "total": 31,     "by_status": {       "Finished": 28,       "Failed": 3     }   } }

*Attachments:*
- Screenshot 2025-08-12 at 3.54.15 PM.png

**Jamie Sabino** - 1:01:28 PM
I"m seeing errors in T&S (TranscribeSummarize), but let's get a ticket open  if possible Gareth Tucker, not sure if this was a negative test or not..

**Gareth Tucker** - 4:17:56 PM
Ok, thanks Jamie. Will get the guys to check in the morning and report back if there are any issues.
*Reactions: 👍*


## 8/14/2025

**Jamie Sabino** - 8:13:40 PM
Hi Everyone, wondering if someone has a "tool" that we can bypass manual uploads of files into vision  that will effectively trigger  the same result as an official file upload complete.    We'd have to wipe out the metagen file etc., the goal is to just re-use the current 50-100 or whatever files constantly.  I think Barry Evans you might be doing something like this with your testing, but this would be great if we had such a tool as work on putting some real world demand on these gpu's (would like them running hot 24/7 if possible), coupled with some prometheus metrics for now which we'd push to wycombe over the few weeks after we string somethings together.

**Jamie Sabino** - 8:30:50 PM
Arunita sahu(IC) Ankit Josh(IC) ^ heads up, if there's something that exists and the team provides, please get it running in Lambda1  right away.. i'm uploading a bunch of stuff overnight to keep things going, but we need a better approach here for our testing..  If not, we'll have to tool something up similar to how your qa test Arunita sahu(IC) works today just to constantly push files.  (fingers crossed there's a tool  already available).
*Reactions: 👍*


## 8/15/2025

**Daniel Iwan** - 1:25:22 AM
I don't think there is much difference between upload ing via browser vs uploading to a filesystem directly and letting ngenea discover it, so some rsync to nfs should be ok?  Unless the point is also keeping the frontend in the loop

**Richard Gittens** - 1:43:18 AM
For QA we just copy over the test file(s) via the filesystem and it should trigger metagen on the newly created file(s).


 


e.g for 1 of our tests it would just be ' cd /mmfs1/data/qa/PixStor1Data && cp -r XTP-4125_MCS-1444/ /mmfs1/data/qa/AI/SSHPixStorTest/'

**Jez Tucker** - 4:35:12 AM
hey Daniel Iwan I am going to bump the versity version on node 02 today.  we had a bit of a delay as we thought the download action was not fixed, but it is testing out fine internally.   Any specific time you would prefer?  (not 3-4).

**Daniel Iwan** - 4:40:31 AM
2 secs

**Daniel Iwan** - 4:41:15 AM
good to go now

**Jez Tucker** - 4:50:08 AM
kk. doing...

**Jez Tucker** - 4:55:10 AM
Daniel Iwan all done on node 02 only

**Jez Tucker** - 4:55:48 AM
expectation is that the download functions now always download rather than open in browser (tested with Chromium)

**Jez Tucker** - 4:56:07 AM
also tested with file system originating file + uploaded file through vision UI

**Daniel Iwan** - 4:56:30 AM
for what cases files were opened?

**Daniel Iwan** - 5:28:40 AM
Richard Gittens just explained, thanks Jez

**Jamie Sabino** - 5:35:45 AM
Thanks Daniel Iwan and Richard Gittens, regarding the file creation automation. I will try the manual copy over and cron it , and assuming I can just delete files as well there and I won’t mess up anything (ie leave proxies behind etc etc)?

**Daniel Iwan** - 5:44:10 AM
it should all auto-clean itself, providing there is enough time for the ngenea workflow to kick in and vision to process Rabbit messages
*Reactions: 👍*

**Justin Toribio** - 5:11:35 PM
Daniel Iwan Gareth Tucker I ran a test job on FTL Node 01 with the metadata payload now including the transcript.  The message should still be in the vision-metadata-xchg debug queue:


 






 


Exchange vision-metadata-xchg
Routing Key 
Redelivered ○
Properties 
timestamp: 1755302657
message_id: 8e454477bca74d00ac6ff9b801149578
correlation_id: 541df074-258b-46f1-a41b-bc9b85e5e71c
priority: 0
delivery_mode: 1
headers: 
correlationId: 541df074-258b-46f1-a41b-bc9b85e5e71c
jobId: 5483f411-86b1-4ba5-9354-a598f39cffed
content_encoding: utf-8
content_type: application/json

**Justin Toribio** - 5:14:36 PM
This is what the payload should look like:

*Attachments:*
- payload.json

**Justin Toribio** - 5:16:11 PM
Vision is picking up the new field, but I believe not displaying it properly because it is not a string object:

**Justin Toribio** - 5:19:56 PM
Please let us know if you have any questions, comments and if you're able to work with this payload as is.


## 8/18/2025

**Daniel Iwan** - 1:39:13 AM
Hi Justin Toribio 


Thank you very much for the example. I don't think FTL has the version which handles the transcription at the moment.


I've noticed following RMQ properties are missing

- app_id

- type


From headers, missing

- tenantId


In the payload itself, missing

- tenantId

- source object

Source object should contain fsInode and s3object, which both should be available in the source event published by Ngenea


 


Also there are some redundant fields, but that should not be a problem

- content_type

- content_encoding


 


All specified here https://perifery.atlassian.net/wiki/spaces/MCS/pages/4275503112/Vision+Metadata+Integration+using+RabbitMQ#Message-format

**Jamie Sabino** - 5:38:06 AM
Daniel Iwan please feel free to update FTL or let’s find someone who can.  We need to keep ftl Cardiff and Wycombe aligned to some degree.

**Gareth Tucker** - 5:49:12 AM
Jamie Sabino FYI, there is no version that handles transcription display yet, that is still on the todo list
*Reactions: 👍*

**Unknown User** - 6:00:50 AM


**Unknown User** - 6:00:58 AM


**Unknown User** - 6:44:46 AM


**Unknown User** - 6:44:48 AM


**Unknown User** - 6:46:57 AM


**Justin Toribio** - 9:01:40 AM
Daniel Iwan Gareth Tucker In the payload, tenantId and source are there, they're just at the bottom/end of the payload...


 





 


Regarding your other notes:


 





 


Gareth Tucker we didn't receive these notes from you last time and the current system is functioning without them.  We can do it, but it will require a bit more of a lift, and so I'm just wondering how necessary these are.  Please let us know, thanks.

*Attachments:*
- messageReference

**Daniel Iwan** - 9:16:49 AM
thanks Justin Toribio, I missed that one. Regarding properties and headers, we can work without those since there are corresponding fields in the payload.
*Reactions: 👍*


## 8/19/2025

**Jamie Sabino** - 12:36:32 PM
Gareth Tucker Jez Tucker Orlando Richards looking for a ganesha expert,  we are constantly dealing with mounting issues and having to restart or even reconfigure config here on FTL Pixstore1.   I can raise a bug, or maybe someone can point me to a doc, but its been a real struggle , i backed up the configuration that used to exist, and minimized it to get rid of a "stale file handle" upstream.   This is a routine process for us, and its very painful, would love to work with someone on a full proof way of doing this for our official documentation..

**Jamie Sabino** - 12:54:54 PM
Iva Kalova ^ maybe let's open a jira in the right location where we can standardize this key part of integration


## 8/20/2025

**Gareth Tucker** - 4:21:28 AM
Orlando Richards are you or one of the PixitMedia team able to help with Jamie's request at all? ^

**Barry Evans** - 4:43:27 AM
Jamie Sabino can we start with some more detail - what config is disappearing? is it mounted one day and not the next? Tell us more about the problem. There really should not be much more to it than "mount my:/share /here"

**Barry Evans** - 4:43:51 AM
are you adding entries to fstab?

**Barry Evans** - 4:43:59 AM
what steps are you taking

**Jamie Sabino** - 6:01:42 AM
I had to modify /etc/ganesha/gpfs.ganesha.exports.conf , restarting the service was failing, was receiving the  stale file pointer exception.

**Barry Evans** - 6:02:00 AM
restart where

**Barry Evans** - 6:02:06 AM
why did you need to modify it

**Jamie Sabino** - 6:02:08 AM
There’s a backup of the original on the file system on the server

**Barry Evans** - 6:02:34 AM
was it a user id lookup thing?

**Jamie Sabino** - 6:02:46 AM
Due to the stale file system error

*Attachments:*
- messageReference

**Barry Evans** - 6:03:12 AM
what did you modify?

**Barry Evans** - 6:04:05 AM
like, was it that you were having troubles to mount it to start, or that it was mounted and then you came and looked and it was stale
*Reactions: 👍*

**Jamie Sabino** - 6:04:28 AM
On the client server (ai+ node) it failed to read , trying to remount failed due to the stale file system issue and apparently the resolve is to restart this on the pix store

**Barry Evans** - 6:04:57 AM
stale filesystem where, or AI+ or on the pixstor?

**Jamie Sabino** - 6:05:35 AM
Correct. Worked , we had to upgrade our installer and noticed it wasn’t able to read the local mounted

**Barry Evans** - 6:05:51 AM
what is correct?

**Barry Evans** - 6:06:14 AM
that is was stale on the AI server? or that it was stale on the pixstor?

**Jamie Sabino** - 6:06:31 AM
Pixstore1 in ftl.  I left the original config there but modified it to what appears to be less configured

*Attachments:*
- messageReference

**Barry Evans** - 6:06:31 AM
in the ganesha config, what did you end up modifying?

**Barry Evans** - 6:06:52 AM
ok so on the pixstor node, it had a stale file handle when you would do df or similar, correct?
*Reactions: 👍*

**Jamie Sabino** - 6:07:37 AM
I can open a jira, let me know where … hence I asked Iva,

**Barry Evans** - 6:08:14 AM
ok - ganesha just "services" the filesystem. So if the filesystem is stale, then the probablem is further downstream

**Barry Evans** - 6:08:19 AM
I will have a look

**Barry Evans** - 6:08:21 AM
please no jira

**Barry Evans** - 6:08:40 AM
it's not going to be a bug its going to be an infrastructure problem or simialr

**Jamie Sabino** - 6:09:28 AM
I just need an official procedure for adding the hook for aiplus mounting. How to confirm etc. this needs to be part of the official procedure.

**Barry Evans** - 6:10:02 AM
it will be whatever ubuntu says it is for mounting and persisting a mounted NFS volume

**Jamie Sabino** - 6:10:03 AM
Thanks Barry.

**Jamie Sabino** - 6:10:49 AM
Well looks like we have to manage it,

*Attachments:*
- messageReference

**Barry Evans** - 6:12:01 AM
this is on ftl-dev-sn-01.pixstor, correct?

**Jamie Sabino** - 6:12:32 AM
Correct. It’s working now, but with a less hardened config

**Barry Evans** - 6:12:48 AM
less hardened config where, the ganesha config??

**Barry Evans** - 6:13:46 AM
i dont see that the filesystem has unmounted on that node at any time in august

**Barry Evans** - 6:14:00 AM
that node being ftl-dev-sn-01.pixstor,

**Barry Evans** - 6:16:29 AM
Jamie sorry I need you to be very verbose on this - X happened when I did Y, A didn't work after B, all on node 1 2 or 3

**Barry Evans** - 6:18:09 AM
taking a step back - everything was fine and it was mounted. Then, one day it wasn't fine anymore. You couldn't mount (what was the error when you couldn't mount), so you changed the exports file in ganesha and restarted, then you could mount - is that the gist of it?

**Jamie Sabino** - 6:20:22 AM
sorry, i didn't keep track of all the details, this was triggered by a http code error, 416 i think, i'm searching for it in my history but can't find it, the result of our gui error was the fact that it was trying to read from the local mounted file system which was now triggering that error. we never unmounted (well, i can't say 100% as many people have access to this node).. but your finding would align with my expectation..

**Barry Evans** - 6:21:04 AM
ok then let's break it to fix it

**Barry Evans** - 6:21:31 AM
I will put that config back the way it was and then you can see if the mount has popped on the AI server

**Jamie Sabino** - 6:21:33 AM
what is the official procedure today ?

**Barry Evans** - 6:21:43 AM
make a share, mount the share

**Jamie Sabino** - 6:21:45 AM
no please don't change it as it will likely break

**Barry Evans** - 6:23:04 AM
k if there is something unique we need to do, then we'll need to schedule a time

**Barry Evans** - 6:23:30 AM
but I need to know the detail before we can do anything else

**Jamie Sabino** - 6:23:32 AM
we can test it on Cardiff , break it there, i'll swing over to that site after, or just provide me the steps to properly confirm a new share on the pixstore node, before mounting..  and yes its a one liner on the client..

**Barry Evans** - 6:23:59 AM
sure if it mounts, then happy days, if it doesn't sad days it's as black and white as that

**Barry Evans** - 6:24:40 AM
there may be something we need to disable to suit the client but I need to see it broken first

**Jamie Sabino** - 6:24:56 AM
also, not sure if its related but the versoty service is constantly breaking on that instance as well, and we have to restart it, assuming its just an old version

**Barry Evans** - 6:25:32 AM
correct not related Orlando Richards can we please get versity bumped in florida

**Jamie Sabino** - 6:26:41 AM
i'm sure to break it again, next time i can leave it in that state. I just need to get this 1.1.2 patch out for R1 , but will need to confirm the mounting procedure for sure for the documentation

*Attachments:*
- messageReference

**Barry Evans** - 6:30:32 AM
k for right now it is "make a share, mount the share"

**Barry Evans** - 6:31:11 AM
if you can reproduce it and let me (or probably Orlando as I will be away), then we can see if there is any addition config server side that needs to be uniquely applied

**Barry Evans** - 6:32:01 AM
but, the shares are managed by hub - so any manual changes are likely to get nuked the next time someone changes pretty much anything in hub

**Barry Evans** - 6:32:24 AM
and that is probably why "here yesterday gone today"

**Orlando Richards** - 7:51:35 AM
If anyone is on - yum -y update versity-ngenea

*Attachments:*
- messageReference

**Barry Evans** - 8:03:25 AM
im on, running

**Barry Evans** - 8:05:30 AM
done

**Jamie Sabino** - 8:30:38 PM
Gareth Tucker fyi, we have the aiplus release with the transcription feature through our end and will be targeting Cardiff as discussed.  I have a few things to do to package the release but need to plan on some downtime . Will synch in the morning . cheers
*Reactions: 👍*


## 8/22/2025

**Gareth Tucker** - 5:16:58 AM
Jamie Sabino thanks for adding the latest version of T&S with the transcription feature enabled to the Cardiff AI+ server last night. It appears to be delivering the metadata correctly for Space 01 on PixStor Dev 01.


 


As touched on in the weekly call yesterday, we are doing our new feature testing on PixStor Dev 02 in Cardiff which is not yet set up for T&S on the Cardiff AI+ server.


 


We are going to need some help setting up the storage and RabbitMQ etc for PixStor Dev 02 and I am guessing it may not be possible to have two space01's mounted on the same AI+ server so we may need to work around that to have Dev 01 and Dev 02 being serviced by the same AI+ server.


 


Let us know your thoughts please. Thanks.

**Jamie Sabino** - 5:22:00 AM
Anything is possible, but would require some work, presuming you will share one rabbit server , but I’m not sure if the rabbit messages handle that (ie if it has the required pieces to distinguish multiple vision instances.

**Gareth Tucker** - 5:25:37 AM
They are completely standalone instances like the FTL set up, no shared Rabbit, each has it's own

**Jamie Sabino** - 5:27:29 AM
If you want to swap, then yes it will require nfs unmounting and remounting and a couple changes on the rabbit config.. but I maybe able to help.  If we use the same user password for rabbit servers for internal labs, then it’s as simple as an ip change

**Gareth Tucker** - 5:28:06 AM
different credentials unfortunately

**Gareth Tucker** - 5:29:08 AM
is it possible to add, as it if was a separate service, rather than update? or can a single AI+ server only have one RabbitMQ configuration at the moment?

**Jamie Sabino** - 6:15:13 AM
i'm positive single threaded.  But, we can likely automate this switch ,but it will take some effort

**Gareth Tucker** - 6:24:36 AM
ok, so if we would like to re-configure, what is the best plan of attack?

**Jamie Sabino** - 6:29:32 AM
1- backup current config and label it appropriately (backup-node1), 2- manually change the relevant configuration (ie rabbit ip, user/password etc),  3 - mount the appropriate NFS share, 4- validate, 5- backup-node2 .  Then when we want to 'switch', it would be a restore and some restarts of impacted services to take the updated config.

**Jamie Sabino** - 6:31:08 AM
My concern here is that its making a convoluted pipeline, we will now have FTL -> Cardiff 1, -> Cardiff 2, -> Wycombe,

**Gareth Tucker** - 6:33:19 AM
Not sure I follow the pipeline comment. Are you referring to keeping them in sync?

**Jamie Sabino** - 6:38:34 AM
we sort of agreed/discussed on a 3 layer / lab pipeline.. with this 3.5 just throws in a procedure for switching that isn't really following a standard installation/upgrade.. which is fine, i get it.

**Jamie Sabino** - 6:39:14 AM
i'm looking at https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4957011969/ca-sn-dev-01+10.20.0.160 and https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4957011980/ca-sn-dev-02+10.20.0.162 , i believe you want to be able to swap between these two,

**Jamie Sabino** - 6:39:21 AM
it doesn't have the rabbit info here, but i'm sure its somewhere

**Jamie Sabino** - 6:40:50 AM
at this point, it would be best if i do the work for time sake and to keep things going, and i can MOP out the procedure and script a switch over as best as i can.. if you feel this will mostly be pointing at this instance for awhile then great.  But sounds like you want to use the 2 nodes in Cardiff as part of your pipeline

**Jamie Sabino** - 6:41:29 AM
given the IRIS components are bigger and more complex, perhaps we look at setting up a secondary / proper GPU node there

**Jamie Sabino** - 6:42:53 AM
I'm behind in setting up a discussion with IT as we have some budget approved for some hardware, would really like to put all our resources in the right spot to ensure not only dev work is supported but our cicd pipelines make sense as well.

**Gareth Tucker** - 6:44:56 AM
Full details from our docs are on here


 


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4297818165/Pixstor+dev+deployment+at+OM#PixStor-Dev-02-(Dev)


 


The FTL Arcapix pages were the first to include RabbitMQ details when I added them to help your integration there so the Cardiff ones don't have them yet.

*Attachments:*
- messageReference

**Gareth Tucker** - 6:48:07 AM
We are using the nodes for separate purposes, Dev (02) and QA (01), ideally both need a full AI+ integration.


 


Previously when not using Rabbit and instead scanning via S3, we were able to get a single AI+ server to service different storage at the same time, but we can live with that short term if that is not currently possibly with Rabbit.

**Jamie Sabino** - 6:49:30 AM
ack Gareth Tucker ..   i'll bring this in,  i'm assuming Monday would be a great time to have it completed for you, which i will target for.  Likely start on this today, assuming no one in QA is working on this yet, and we are fine to do what we need to do?

**Gareth Tucker** - 6:49:31 AM
01 is currently running the Iris R1 Beta versions, and 02 is running our R1 GA work-in-progress versions until we have some stability on the new features.

**Gareth Tucker** - 6:51:39 AM
Monday would be very helpful, we are working around it by manually dropping in RabbitMQ messages at the moment.


 


QA are trying the new features out on 02, but are not focussed on the AI+ integration at the moment, so you are good to make changes when ready.

*Attachments:*
- messageReference

**Jamie Sabino** - 6:57:16 AM
ok, i'll work on it, might be simple  , going to try the happy path approach quickly , if i break it, enjoy a pint for me at the pub , as i'll be pulling my hair out lol
*Reactions: 😆*

**Orlando Richards** - 6:58:06 AM
Just to be clear - the FTL sn-01 and sn-02 virtual machines, and the Cardiff sn-01 and sn-02 virtual machines, and the high wycombe lab systems, are NOT intended for CI/CD use, but as reference platforms for active development and demonstration
*Reactions: 👍*

**Orlando Richards** - 6:58:40 AM
but - the FTL systems are kinda yours to do with what you want, so if they're best used for CI/CD to support your development needs, then that's entirely your call!

**Orlando Richards** - 6:59:37 AM
(also the ALT lab - that's demo grade)

**Orlando Richards** - 7:00:35 AM
Similarly - if Gareth & co want to use the Cardiff VM systems for CI/CD to best support their development journey, that's up to them!

**Jamie Sabino** - 7:23:52 AM
I think Jez is the expert here, but i need the procedure to fix this: 


 



(base) perifery@cardiff-ai:~$ sudo mount -t nfs 10.20.0.162:/mmfs1 /mmfs1

mount.nfs: mounting 10.20.0.162:/mmfs1 failed, reason given by server: No such file or directory

(base) perifery@cardiff-ai:~$ showmount -e 10.20.0.162

Export list for 10.20.0.162:

(base) perifery@cardiff-ai:~$ showmount -e 10.20.0.160

Export list for 10.20.0.160:

/mmfs1 10.20.1.73/32

(base) perifery@cardiff-ai:~$

**Barry Evans** - 7:24:59 AM
ok perfect now we're talkin
*Reactions: 😆*

**Jamie Sabino** - 7:24:59 AM
Gareth Tucker or Orlando Richards, Jez i think did this for us in the cover of darkness in the past..  who can jump on a bridge with me, so we can document this aspect around setting up the data folder here

**Jamie Sabino** - 7:25:15 AM
(and Barry slides in lol)

**Barry Evans** - 7:25:48 AM
first, just do: mount -o vers=3 10.20.0.162:/mmfs1 /mmfs1

**Barry Evans** - 7:25:56 AM
try that quick

**Barry Evans** - 7:26:14 AM
ah ok

**Barry Evans** - 7:26:34 AM
Orlando Richards is this on "the vpn"

**Barry Evans** - 7:26:51 AM
yes, yes it is

**Jamie Sabino** - 7:26:55 AM
I think this is something we have to do on Ngenea?

**Barry Evans** - 7:27:01 AM
hold fire
*Reactions: 👍*

**Barry Evans** - 7:30:07 AM
dev-02 you're tryng to hit, yeah?

**Jamie Sabino** - 7:31:34 AM
yes

**Jamie Sabino** - 7:31:55 AM
i can hit it, won't mount due to it not being "configured"??

**Barry Evans** - 7:32:06 AM
yep there are no exports

**Jamie Sabino** - 7:32:08 AM
export list is empty (compared to .60)

**Barry Evans** - 7:33:46 AM
can't do a call, but I can drop screen shots as I go

**Barry Evans** - 7:35:06 AM


**Barry Evans** - 7:35:23 AM


**Barry Evans** - 7:35:36 AM


**Barry Evans** - 7:35:47 AM


**Barry Evans** - 7:36:19 AM


**Barry Evans** - 7:36:38 AM


**Barry Evans** - 7:37:00 AM


**Barry Evans** - 7:37:12 AM


**Barry Evans** - 7:37:42 AM
Jamie Sabino what's the IP of the AI plus server and can you pop me the creds

**Jamie Sabino** - 7:38:56 AM
bridge.. sorry i was configuring in parrallel

**Jamie Sabino** - 7:39:11 AM
let's record this please..

**Barry Evans** - 7:39:27 AM
cant do a bridge, can drop screen shots, nothing left out

**Barry Evans** - 7:39:31 AM
sorry

**Barry Evans** - 7:39:43 AM
ip/creds please

**Jamie Sabino** - 7:39:53 AM
yep one second

**Gareth Tucker** - 7:40:27 AM
10.20.1.73

**Gareth Tucker** - 7:40:43 AM
Username: perifery


Password: ntey74busdmwv9jckh3g

**Gareth Tucker** - 7:40:51 AM
https://perifery.atlassian.net/wiki/spaces/MCS/pages/4278356727/Cardiff+AI+Server

**Jamie Sabino** - 7:41:53 AM
Barry Evans sent you the ai node info in chat

**Barry Evans** - 7:42:03 AM
thanks guys

**Jamie Sabino** - 7:42:15 AM
that's a root user, lets use the aiuser please

*Attachments:*
- messageReference

**Barry Evans** - 7:42:34 AM
need root

**Barry Evans** - 7:42:59 AM


**Jamie Sabino** - 7:43:00 AM
it has sudo priveledges.. but all good..

**Barry Evans** - 7:43:12 AM
thats cool

**Barry Evans** - 7:43:14 AM


**Barry Evans** - 7:43:34 AM


**Barry Evans** - 7:43:42 AM


**Barry Evans** - 7:44:02 AM


**Barry Evans** - 7:44:12 AM


**Barry Evans** - 7:45:16 AM


**Barry Evans** - 7:45:27 AM


**Barry Evans** - 7:45:47 AM


**Barry Evans** - 7:45:57 AM


**Barry Evans** - 7:46:19 AM
still stick that in a doc

**Barry Evans** - 7:46:43 AM
sorry, will stick that in a doc, rather

**Jamie Sabino** - 7:47:42 AM
thanks Barry, as long as its even searchable here in teams its a start!! I can incorporate it in as well somewhere..

**Barry Evans** - 7:57:27 AM
do your services run as root, or as a difference, specific user?

**Jamie Sabino** - 7:58:17 AM
user,

**Jamie Sabino** - 7:58:30 AM
"aiuser" in this instance..

**Barry Evans** - 7:58:43 AM
that will be a challenge, we will need to have a think about that

**Jamie Sabino** - 8:00:20 AM
pretty standard though, typically admin's wont' provide root user accounts but privileged /managed user accounts

**Barry Evans** - 8:00:32 AM
yes and no

**Barry Evans** - 8:00:42 AM
this is essentially a "service" account

**Jamie Sabino** - 8:01:06 AM
Gareth Tucker i think we are in business..

*Attachments:*
- Screenshot 2025-08-22 at 10.58.06 AM.png

**Barry Evans** - 8:01:17 AM
it will need to be able to read the data that's there and in most production situations, whatever user you choose isn't necessarily going to have access

**Barry Evans** - 8:01:32 AM
I'm surprised that worked

**Barry Evans** - 8:01:49 AM
but ill take it

**Jamie Sabino** - 8:01:50 AM
haha .. why?? check out the colour of my hair.. there's a reason

**Barry Evans** - 8:02:33 AM
because the way the permissions are setup if that was being read in by aiuser rather than root, it shouldn't have been able to hit it

**Barry Evans** - 8:02:44 AM
can you get to this?

**Barry Evans** - 8:02:46 AM
https://arcapix.atlassian.net/wiki/spaces/~bevans/pages/5089165411/NFS+Export+for+AI

**Jamie Sabino** - 8:03:11 AM
yes i can view it.

**Jamie Sabino** - 8:04:49 AM
i'll whip up the mop for Cardiff Vision Swap for aiplus

**Gareth Tucker** - 8:23:48 AM
Cheers Jamie, I will have a play with that now

**Jamie Sabino** - 8:29:17 AM
Gareth Tucker https://perifery.atlassian.net/wiki/spaces/AI/pages/4421386252/Cardiff+Dev01+Dev02+Server+Swap+for+AI , let me know if you can view it.. it wasn't that bad to do, assuming the mounting procedure sticks as noted above, likely a 5 minute excersize now.

**Gareth Tucker** - 8:30:35 AM
lovely, thanks Jamie, I can reach that
*Reactions: 👍*

**Gareth Tucker** - 10:42:49 AM
One for the PixitMedia team to review on Tuesday please.


 


We have a file that was uploaded to PixStor Dev 02 that was failing to be processed by dynamo.tasks.iris.exiftool with the following error


 


 



 


    "queue": "ca-sn02#custom",
    "status": {
      "task": "dynamo.tasks.iris.exiftool",
      "details": {
        "aborted": [],
        "skipped": [],
        "failures": [
          {
            "path": "/mmfs1/data/space01/BenTest/100mb.md5",
            "message": [
              "[Errno 1] Unspecified error"
            ]
          }
        ],
 


this was then causing filesystem events to be created on repeat, each time the Iris Notify job ran. Full job output is attached.


 


The problem file has been removed for now to allow things to progress normally, but it can be retrieved from PixStor Dev 01 in the following location if you would like to try to reproduce it.


 



qa/BenTest/100mb.md5

*Attachments:*
- 100mb.md5.exiftool.log


## 8/25/2025

**Unknown User** - 6:00:30 AM


**Unknown User** - 6:00:38 AM


**Unknown User** - 6:08:20 AM


**Unknown User** - 6:08:21 AM


**Unknown User** - 6:08:39 AM



## 8/26/2025

**Orlando Richards** - 4:06:32 AM
Gareth Tucker Daniel Iwan - i'm getting the High Wycombe cluster prepped for IBC, but am having problems with Vision:


 



It's not hitting hub to look up my buckets, from what I can tell, when I log in - so I get a 404I'm getting java heap errors from the media transcoder:




 


Aug 26 12:04:26 hw-prod-mn-01 docker[43387]: media-transformer-1  | Terminating due to java.lang.OutOfMemoryError: Java heap space



Any chance you can spare me 10 mins on a call to debug?

**Orlando Richards** - 4:11:05 AM
I think i'm getting a 401 error - but i'm not seeing it in the nginx logs at all, so I don't really know what it's getting a 401 from!

**Orlando Richards** - 4:11:52 AM
If you have vpn access:


https://10.60.0.20:9505


user: pixadmin


pass: edison2

**Orlando Richards** - 4:12:07 AM
login via SSH to 10.60.0.20, username: root, pass: edison2

**Gareth Tucker** - 4:12:12 AM
ok, I have a meeting to prep for at 12:30 which rules me out short term.


 


404 on the hub feels like user may not have been given access to any spaces in Hub.


 


Heap errors suggest we have a file that needs to be transcoded that is exceeding the default heap configuration.

**Gareth Tucker** - 4:12:33 AM
We will take a look as soon as one of us free's up though

**Gareth Tucker** - 4:12:40 AM
we both have VPN access

**Orlando Richards** - 4:13:21 AM
awesome - thanks!

**Orlando Richards** - 4:13:32 AM
holler if i can hop on a call to assist
*Reactions: 👍*

**Daniel Iwan** - 4:17:43 AM
I need 10 mins, and I can have a look
*Reactions: 👍*

**Daniel Iwan** - 5:00:37 AM
I'm on it now

**Orlando Richards** - 5:02:15 AM
holler if you want a buddy Daniel Iwan!
*Reactions: 👍*

**Daniel Iwan** - 5:09:40 AM
certificate does not have 10.60.0.20 possibly?

**Daniel Iwan** - 5:20:27 AM
that is cert for mcs-nginx container, were cert in tls substituted? because looks like they have 


 



 


            X509v3 Subject Alternative Name: 
                DNS:*.lab.int.arcapix.com
 


from Let's Encrypt, Aug 25th

**Unknown User** - 6:00:29 AM


**Unknown User** - 6:00:37 AM


**Orlando Richards** - 6:11:46 AM
I renewed that yesterday...

**Orlando Richards** - 6:11:58 AM
think that needs bringing into vision?

**Gareth Tucker** - 6:25:23 AM
Apxxattr.%41%50%58tm512

**Daniel Iwan** - 6:25:35 AM
from aws-cli






 


{
    "AcceptRanges": "bytes",
    "Restore": "",
    "LastModified": "2025-08-07T11:38:36+00:00",
    "ContentLength": 8603725,
    "ETag": ":3300357220954201602:274944:1721195317",
    "ContentType": "binary/octet-stream",
    "Metadata": {
        "apxctime": "2025-08-07 12:38:36.114716597+01:00",
        "apxatime": "2025-08-07 12:38:36.114716597+01:00",
        "apxaclxx": "nfs4:nfs4:{A::OWNER@:acCnNortTwy,A::GROUP@:cnrty,A::EVERYONE@:cnrty}",
        "apxxattr.%41%50%58rmtlc": "versity_ngenea_backend_bucket%3Aspace01/%48ockey_512kbit.mp4",
        "etag": ":3300357220954201602:274944:1721195317",
        "apxowner": "root/0",
        "apxmtime": "2025-08-07 12:38:36.114716597+01:00",
        "apxxattr.%41%50%58tm512": "2025-07-16%2016%3A37%3A04.133590565",
        "apxxattr.%41%50%58rmtsz": "8603725",
        "apxxattr.%41%50%58mgtlc": "2025-07-17%2007%3A30%3A57.590271763",
        "apxguuid": "7178e8fb-9dfe-46a7-a2f3-ebfad99d01c7",
        "apxfmode": "0644",
        "apxgroup": "root/0",
        "apxxattr.region": "%FF%FF%FF%FF%FF%FF%FF%FF%00%00%00%00%00%00%00%00%06%00%00%00%00%00%00%00"
    },
    "StorageClass": "PREMIGRATED"
}

**Orlando Richards** - 6:29:31 AM
Gareth Tucker - here's the user report about case sensitivity:


 


 


got question from user

 


ALSO - I am having BIG problems with search in Pixit because it seems to be case sensitive. Is it possible to change that so it isn't case sensitive?
how do you ignore case in pixstor search?e.g dot and DOT gives different resultHub version 2.6.0-1
*Reactions: 👍*

**Orlando Richards** - 6:29:34 AM
Make of that what you will

**Unknown User** - 6:52:34 AM


**Unknown User** - 6:52:34 AM


**Unknown User** - 6:54:44 AM


**Jez Tucker** - 7:50:12 AM
Jamie Sabino I have hand modified the vision_notify workflow in the FTL to add those excludes so you do not get events for the .sgwtmp/* and .resources/*, etc.


Your system is on pixstor 6.10.0-0.alpha.13 which in this hackathon is somewhat 'old' now.


In newer versions the workflow is renamed to iris_notify and the exclusions are in by default.


I don't know what the impact of suggesting that your node comes up to 'now' is (iris would be wiped).  Something for your team to consider.
*Reactions: 👍*

**Gareth Tucker** - 8:37:19 AM
Jez Tucker here are the problem files discussed in the call

**Gareth Tucker** - 8:38:02 AM
The file that was failing to be processed by exiftool and causing file creation events to be created on a loop is


 


https://vision.object-matrix.com:8443/objects/2cdd2d94-575f-b000-4ceb-2b99d346e730/b5925579-7416-11ea-8a75-c84cb3407db4/c908f6a8-828e-11f0-9053-e3ff2fb78f7e-2/view?X-Mxs-AccessKeyId=6c4d0513-503d-4946-a113-3fc9b8627545&X-Mxs-SpaceId=7049e8e0-2bf3-11e9-97f4-d3d17c60f087&X-Vis-CreatedDate=20250826T151518Z&X-Vis-Expires=31536000&X-Vis-SigVersion=1&X-Vis-Signature=ec8ef0871d375e5dae8ef5efe481cf31f4a698109244fc73824cbbc9019f9817

**Gareth Tucker** - 8:38:31 AM
The file that is causing VersityGW to restart during upload via Vision is


 


https://vision.object-matrix.com:8443/objects/2cdd2d94-575f-b000-4ceb-2b99d346e730/b5925579-7416-11ea-8a75-c84cb3407db4/faba1aeb-828f-11f0-a55c-dd2b2d3b1ffe-0/view?X-Mxs-AccessKeyId=6c4d0513-503d-4946-a113-3fc9b8627545&X-Mxs-SpaceId=7049e8e0-2bf3-11e9-97f4-d3d17c60f087&X-Vis-CreatedDate=20250826T151914Z&X-Vis-Expires=31536000&X-Vis-SigVersion=1&X-Vis-Signature=1af7c02639fa36b242e626d4f0ba9256466958b62f6f1be224ac426e30b850cb

**Jez Tucker** - 9:07:32 AM
thanks. I'll pick these up


## 8/27/2025

**Gareth Tucker** - 4:01:52 AM
Jez Tucker re: the VersityGW restart, there may be another factor in the mix, but they are possibly unrelated. We currently have a folder that causes the gateway to restart whenever you browse to it on PixStor Dev 02. The path is


 


 



 


https://ca-sn-dev-02.om.cardifflab:9505/object-listing/space01/Bogdan%2FVideos%2F
 


and the log shows the following


 



 


Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: 11:55:53 | 200 |    1.771171ms | 127.0.0.1 | GET | /space01 | - | list-type=2&delimiter=%2F&max-keys=50&prefix=Bogdan%2FVideos%2F
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: panic: runtime error: invalid memory address or nil pointer dereference
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: [signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x1912b9e]
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: goroutine 26 [running]:
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/versity/versitygw/backend/ngenea.(*Ngenea).GetObject(0xc000136190, {0x2008db8, 0xc000031208}, 0xc0005b20c0)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/backend/ngenea/ngenea.go:328 +0x77e
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/versity/versitygw/s3api/controllers.S3ApiController.GetActions({{0x201b140, 0xc000136190}, {0x200e540, 0xc0005c0000}, {0x0, 0x0}, {0x0, 0x0}, 0x0, 0x0, ...}, ...)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/controllers/base.go:513 +0x3510
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*App).next(0xc000494008, 0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:143 +0x1be
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*Ctx).Next(0x1c46b60?)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1028 +0x4d
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/versity/versitygw/s3api.New.AclParser.func8(0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/acl-parser.go:84 +0x7d8
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc0005e0308?)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/versity/versitygw/s3api.New.VerifyMD5Body.func7(0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/md5.go:32 +0x2bb
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*Ctx).Next(0x8?)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/versity/versitygw/s3api.New.VerifyV4Signature.func6(0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/authentication.go:52 +0x123d
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc00048c140?)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/versity/versitygw/s3api.New.VerifyPresignedV4Signature.func5(0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/presign-auth.go:90 +0x7ce
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc0005e0308?)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/versity/versitygw/s3api.New.DecodeURL.func2(0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/url-decoder.go:34 +0x173
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*App).next(0xc000494008, 0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:143 +0x1be
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc00059e090?)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1028 +0x4d
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2/middleware/logger.New.func3(0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/middleware/logger/logger.go:119 +0x2ed
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*App).next(0xc000494008, 0xc0005e0308)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:143 +0x1be
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/gofiber/fiber/v2.(*App).handler(0xc000494008, 0xb4768f?)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:170 +0x69
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/valyala/fasthttp.(*Server).serveConn(0xc000498008, {0x200fed8, 0xc0005d4388})
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/server.go:2455 +0x11b1
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/valyala/fasthttp.(*workerPool).workerFunc(0xc000366000, 0xc000484060)
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:225 +0x92
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: github.com/valyala/fasthttp.(*workerPool).getCh.func1()
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:197 +0x32
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]: created by github.com/valyala/fasthttp.(*workerPool).getCh in goroutine 6
Aug 27 11:55:53 ca-sn-dev-02 versitygw-iris[1347606]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:196 +0x194
Aug 27 11:55:53 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Main process exited, code=exited, status=2/INVALIDARGUMENT
Aug 27 11:55:53 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Failed with result 'exit-code'.
Aug 27 11:55:54 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Service RestartSec=100ms expired, scheduling restart.
Aug 27 11:55:54 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Scheduled restart job, restart counter is at 135.
Aug 27 11:55:54 ca-sn-dev-02 systemd[1]: Stopped Ngenea enabled Versity Gateway S3 service.
Aug 27 11:55:54 ca-sn-dev-02 systemd[1]: Started Ngenea enabled Versity Gateway S3 service.
 


There is only 1 file in the folder and it was uploaded earlier today to test generation of a larger transcription for the Dev work we are doing on that topic.


 


We have left the file there for now just in case you would like to take a closer look at it.

**Jez Tucker** - 4:30:42 AM
That looks like the same issue - ngenea.go:328


I have pulled the file over for Tony and he is seeing if we can reproduce without needing to do it on your system

**Jez Tucker** - 4:31:21 AM
FYI This is a different issue to the prior multipart upload behaviour
*Reactions: 👍*

**Orlando Richards** - 6:39:51 AM
Jamie Sabino - the High Wycombe production cluster is ready for AI+ integration. Details are here: https://arcapix.atlassian.net/wiki/spaces/Labs/pages/5060362264/HW+Prod+Cluster+-+Iris


Please add any additional info to that page that you think will be useful.


 


 


The AI+ server hw-ngbox-gpu-02 currently has /mmfs1 mounted via nfsv3, with the following entry in fstab:


 



 


10.60.0.21:/mmfs1 /mmfs1  nfs  defaults,vers=3 0 1
 


The goals are:



Back up / record the prompts currently in place on the AI+ server, and re-create them after the system has been re-integratedIntegrate the AI+ server into the hw-prod-mn-01 Vision instance

 
You have full permission to do whatever you need to on the hw-ngbox-gpu-02 server (the AI+ node), with no notification to anyone or request for service outages/downtime, whenever you want. If you need work done on the wider cluster/infrastructure, let me know.


 


The folder /mmfs1/data/perifery can be used for functional testing/setup - feel free to add/delete anything you want in this folder. The folder /mmfs1/data/space01 is also enabled for Iris, and can also be used for additional testing if required. The /mmfs1/data/vizhub folder contains the "production" content which will be used for the demos, so stay out of that for testing/setup - but it will need to be enabled at the end of the re-deployment.
*Reactions: 👍*


## 8/28/2025

**Jamie Sabino** - 6:43:47 PM
Jez Tucker, i was trying to follow the mop Barry provided for the nfs mounting for AI+ here https://arcapix.atlassian.net/wiki/spaces/~bevans/pages/5089165411/NFS+Export+for+AI, what's interesting is that i follow the steps, save and see the jobs finish (minus 1 of them ), but when i go back in its as if the configuration never saved, and its missing again.  


 



administrator@per-ai:/$ sudo mount 192.168.18.10:/mmfs1 /mmfs1

mount.nfs: Connection refused

administrator@per-ai:/$


 



 


Hoping we can get this sorted tomorrow quickly and update the mop and or everything else at Alt.  TBD (Jason Perr ^^ fyi)

**Jamie Sabino** - 7:50:09 PM
Orlando Richards getting a redirect error on Wycombe  (Arunita sahu(IC) Ankit Josh(IC)) fyi, keep an eye out on this thread for an update here.  Also, the nfs mount is causing issues again

*Attachments:*
- Screenshot 2025-08-28 at 10.46.36 PM.png
- Screenshot 2025-08-28 at 10.46.27 PM.png

**Jamie Sabino** - 8:01:11 PM
unable to access Hub with the usr/pasword listed in https://arcapix.atlassian.net/wiki/spaces/Labs/pages/5060362264/HW+Prod+Cluster+-+Iris .  My hunch is that the configuration is blown away there again as well, and we need to work through the "Barry" mop.

*Attachments:*
- Screenshot 2025-08-28 at 10.59.54 PM.png

**Jamie Sabino** - 8:09:11 PM
Orlando Richards and Gareth Tucker fyi, i'm not going to muck around on these systems, my assumption is there's other folks working on it ?? Hopefully we can get this sorted without too much pain.  Arunita sahu(IC) and Ankit Josh(IC) i'm in the middle of the easy-install, need the mmfs fixed again, but let's leave that for Orlando and team.  Once that's back up and going, we can continue through the process (right now we can't configure IRIS due to the NFS mounting issue which is likely a HUB configuration issue again). Once that is through, i have the backups stored in /var/backups/* to restore consul and postgress for the prompts.

*Attachments:*
- Screenshot 2025-08-28 at 11.05.17 PM.png
*Reactions: 👍*

**Jamie Sabino** - 8:09:59 PM
let's jump on a bridge and debug this and review Barry's mop.  We'll need to fix ALT as well likely with the same procedure.


## 8/29/2025

**Orlando Richards** - 12:55:30 AM
Looks like we had a hardware failure on hw-prod-nvme-04 14 hours ago

**Gareth Tucker** - 12:58:55 AM
On this one Jamie, it looks like you accessed via IP and it is not setup to redirect for that. Looks like you got in via hostname later tho.




https://hw-prod-mn-01.lab.int.arcapix.com:9505/

*Attachments:*
- messageReference

**Gareth Tucker** - 1:04:22 AM
I will let Orlando Richards and the team dig deeper as the rest looks consequential based on Orlando's feedback. Give us a shout if you need any help Orlando.

**Orlando Richards** - 1:07:30 AM
Thanks Gareth - looks like we had a hardware failure, which took the FS offline due to a configuration issue. Resolving that now.

**Orlando Richards** - 1:16:26 AM
All sorted now Jamie Sabino.

*Attachments:*
- messageReference

**Orlando Richards** - 1:17:21 AM
Note - to mount nfs, you just need to do mount /mmfs1 on that hw-ngbox-gpu-02 server - it's in the fstab. (assuming the main cluster isn't broken! )

**Orlando Richards** - 3:56:51 AM
Getting a bunch of tracebacks in the HW Prod Lab Vision - Daniel Iwan, any idea how we can get rid of these? I don't think they're critical, but suspect some metadata file has been deleted somewhere and we just need to tell it to stop looking for it:


 






 


Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        | 2025-08-29T10:55:00.483Z  WARN 1 --- [ntContainer#3-1] s.a.r.l.ConditionalRejectingErrorHandler : Execution of Rabbit message listener failed.
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        | org.springframework.amqp.rabbit.support.ListenerExecutionFailedException: Listener method 'void com.om.mcs.metadata.messaging.pixstor.PixstorMessageListener.listen(org.springframework.amqp.core.Message)' threw exception
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.invokeHandler(MessagingMessageListenerAdapter.java:279) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.invokeHandlerAndProcessResult(MessagingMessageListenerAdapter.java:217) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.onMessage(MessagingMessageListenerAdapter.java:148) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer.doInvokeListener(AbstractMessageListenerContainer.java:1694) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer.actualInvokeListener(AbstractMessageListenerContainer.java:1616) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer.invokeListener(AbstractMessageListenerContainer.java:1604) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer.doExecuteListener(AbstractMessageListenerContainer.java:1595) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer.executeListenerAndHandleException(AbstractMessageListenerContainer.java:1540) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer.lambda$executeListener$8(AbstractMessageListenerContainer.java:1518) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at io.micrometer.observation.Observation.observe(Observation.java:498) ~[micrometer-observation-1.14.7.jar:1.14.7]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.AbstractMessageListenerContainer.executeListener(AbstractMessageListenerContainer.java:1518) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer.doReceiveAndExecute(SimpleMessageListenerContainer.java:1085) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer.receiveAndExecute(SimpleMessageListenerContainer.java:1021) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer$AsyncMessageProcessingConsumer.mainLoop(SimpleMessageListenerContainer.java:1423) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.SimpleMessageListenerContainer$AsyncMessageProcessingConsumer.run(SimpleMessageListenerContainer.java:1324) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at java.base/java.lang.Thread.run(Unknown Source) ~[na:na]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        | Caused by: java.lang.RuntimeException: Event processing failed. Cause Error reading sidecar
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at com.om.mcs.metadata.md.EventProcessedHandler.handleFailure(EventProcessedHandler.java:66) ~[classes/:0.4.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at com.om.mcs.metadata.messaging.pixstor.PixstorMessageListener.listen(PixstorMessageListener.java:62) ~[classes/:0.4.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at jdk.internal.reflect.GeneratedMethodAccessor36.invoke(Unknown Source) ~[na:na]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at java.base/jdk.internal.reflect.DelegatingMethodAccessorImpl.invoke(Unknown Source) ~[na:na]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at java.base/java.lang.reflect.Method.invoke(Unknown Source) ~[na:na]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.messaging.handler.invocation.InvocableHandlerMethod.doInvoke(InvocableHandlerMethod.java:169) ~[spring-messaging-6.2.7.jar:6.2.7]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.adapter.KotlinAwareInvocableHandlerMethod.doInvoke(KotlinAwareInvocableHandlerMethod.java:45) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.messaging.handler.invocation.InvocableHandlerMethod.invoke(InvocableHandlerMethod.java:119) ~[spring-messaging-6.2.7.jar:6.2.7]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.adapter.HandlerAdapter.invoke(HandlerAdapter.java:75) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         at org.springframework.amqp.rabbit.listener.adapter.MessagingMessageListenerAdapter.invokeHandler(MessagingMessageListenerAdapter.java:270) ~[spring-rabbit-3.2.5.jar:3.2.5]
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |         ... 15 common frames omitted
Aug 29 11:55:00 hw-prod-mn-01 docker[1513396]: metadata-api-1        |
Aug 29 11:55:07 hw-prod-mn-01 docker[1581277]: rabbitmq-1      | 2025-08-29 10:55:07.581059+00:00 [info] <0.23905.41> acce

**Daniel Iwan** - 4:10:31 AM
will take a look, I'm assuming AIPlus integration has been enabled?

**Orlando Richards** - 4:12:24 AM
not yet - but it's likely the same folder that we set up for NAB way back in spring

**Orlando Richards** - 4:12:40 AM
(Jamie couldn't get the integration finished overnight because the cluster filesystem was down)

**Daniel Iwan** - 4:25:02 AM
I may need to stop metadata-api to investigate

**Daniel Iwan** - 4:31:44 AM
it's stuck on events for mmfs1 bucket which is possibly not iris-enabledbb , also something different, periphery space is on /mmfs1/ngenea mountpoint not ususal /mmfs1/data ?

**Daniel Iwan** - 4:38:02 AM
essentially I think info for the object


 



 


{"endpointUrl": "https://10.100.0.1:7070", "bucket": "mmfs1", "key": "ngenea/periphery/"
 


does not match , the bucket should be periphery I'm guessing


and the key instead of 


"ngenea/periphery/aehbbe.jpg"
should be






"aehbbe.jpg"

**Jamie Sabino** - 8:11:27 AM
Orlando Richards or Jez Tucker working through Wycombe, did someone have a poke at ALT on the NFS/ Hub set up there? would love to quickly get that fixed as well to bring them online before the weekend

**Jez Tucker** - 9:17:45 AM
nope. sorry, I thought that had been resolved. will look now.

**Jez Tucker** - 9:21:01 AM
Jamie Sabino above is a conversation about NFS in the HW lab.  I am missing any reference, or node name, etc. for the alt latb.


I can see a node called per-ai, but there is nothing to do there as it's a GPFS client and can already see the data.


Can you please join the dots for me / point me at what I have missed?

**Jez Tucker** - 9:36:24 AM
Jamie Sabino I am unable to find any recent conversation of something not working at Alt.   I will be afk in ~30 mins.

**Jamie Sabino** - 9:47:01 AM
Jez Tucker maybe you Jason Perr we can jump on a bridge.. I think ALT is likely outdated as well

**Jez Tucker** - 9:55:39 AM
I can jump on a call for 5 minutes, then I have to leave to drive somewhere

**Unknown User** - 9:58:01 AM


**Unknown User** - 9:58:08 AM


**Jamie Sabino** - 9:58:17 AM
Jez Tucker i'm on the bridge now, but i don't think 5 minutes will cover it

**Jamie Sabino** - 9:58:27 AM
Jason Perr ^

**Jamie Sabino** - 10:03:36 AM
have to drop.. We'll get ALT info over for full review .. catch up Monday.

**Unknown User** - 10:06:14 AM


**Unknown User** - 10:06:15 AM


**Unknown User** - 10:06:39 AM


**Jamie Sabino** - 1:56:56 PM
Everyone, just a quick update on Wycombe, I've been able to upgrade and reconfigure and restore key data items (to be confirmed, ie, prompts etc.).  I was only able to validate by pushing files via command line as the UI appears to be down again like last night with the redirect issue, so that needs to be confirmed.  Secondly there's a GUI issue on our end with the CONFIG not showing properly on the UI, (i'll work through that). System survived to reboots , (which is a big win in our space believe it or not).  This side of the pond is off on Monday for a stat holiday, but i'll synch with UK team on Monday .. cheers

*Attachments:*
- Screenshot 2025-08-29 at 4.38.56 PM.png
*Reactions: 👍*


## 9/1/2025

**Jez Tucker** - 5:09:04 AM
Hello folks. I would like to take cardiff-02 out of service until 2pm for the integration upgrade as discussed with Gareth Tucker earlier today


Can you confirm this is ok to do so?

**Jez Tucker** - 5:13:08 AM
Gareth Tucker David Bridger Daniel Iwan bump

**Daniel Iwan** - 5:14:16 AM
ok with me

**Bogdan Stanciu** - 5:14:22 AM
Hi Jez, 2 more minutes please

**Gareth Tucker** - 5:14:29 AM
Go for it Jez, guys had a heads up earlier

**Jez Tucker** - 5:14:30 AM
kk

**Jez Tucker** - 5:14:42 AM
(kk to bogdan for 2 more mins)
*Reactions: 👍*

**Bogdan Stanciu** - 5:18:03 AM
all good from my side

**Jez Tucker** - 5:18:40 AM
ta. upgrade / reboots / etc. occurring
*Reactions: 👍*

**Jez Tucker** - 5:31:26 AM
After today if someone might be able to get the default route > 100Mbit that would be super handy.

**Jez Tucker** - 5:35:13 AM
Perhaps it is.. the speed to the node is only 13-16MB/s on average though (suspect with compression..)

**Gareth Tucker** - 5:35:28 AM
Will ask Ops from our side to take a look into this, they are not on this feed

**Gareth Tucker** - 5:36:24 AM
Where are you pulling from Jez for the speeds you are seeing? I am assuming it is your repo just wasn't sure where it is hosted

**Orlando Richards** - 5:38:51 AM
eurepo.arcapix.com
 



it's a google load balancer endpoint
*Reactions: 👍*

**Jez Tucker** - 5:39:44 AM
node has rebooted. running pixstor apply


then some twiddling to do with software pkgs.
*Reactions: 👍*

**Jez Tucker** - 5:39:58 AM
PixStor Version: 6.10.1-1

**Orlando Richards** - 5:45:57 AM
I'm on a customer upgrade - I won't be able to join this afternoon's call
*Reactions: 👍*

**Unknown User** - 6:00:59 AM


**Unknown User** - 6:01:08 AM


**Nonso Ibenegbu** - 6:04:08 AM
https://10.201.2.156:8443/admin/master/console

**Nonso Ibenegbu** - 6:12:29 AM
https://arcapix.atlassian.net/wiki/spaces/NGHUB/pages/5030838274/IRIS+R2+Development+Reference#3.-Keycloak%3A-Internal-Java-environment

**Nonso Ibenegbu** - 6:20:01 AM
JWT_EXPOSED_JSON

**Jamie Sabino** - 6:28:48 AM
Gareth Tucker won’t be able to join , but if someone can post an update on Wycombe , my guess is we are targeting end of the week to have it fully updated (iris and ai+) .

**Unknown User** - 7:01:41 AM


**Unknown User** - 7:01:42 AM


**Unknown User** - 7:04:55 AM


**Orlando Richards** - 7:38:31 AM
Jamie Sabino - the GUI is working fine this end - but it looks like you're using https://10.60.0.20 in your URL bar, which would be wrong - is that a correct assessment? If so, you just need to use https://hw-prod-mn-01.lab.int.arcapix.com in your URL bar and it should work.

*Attachments:*
- messageReference

**Jez Tucker** - 7:40:25 AM
ok. folks. I am out of my meeting and will start prepping cardiff-01 for some tlc
*Reactions: 👍*

**Jez Tucker** - 7:40:42 AM
no service interruption yet

**Jez Tucker** - 8:04:35 AM
I need to free some space in var, so was planning to do a docker system prune.  any reason why I cannot do this on cardiff-01 ?

**Jez Tucker** - 8:04:48 AM
docker system prune
WARNING! This will remove:
  - all stopped containers
  - all networks not used by at least one container
  - all dangling images
  - unused build cache

**Jez Tucker** - 8:05:01 AM
looks like all your containers are up

**Jez Tucker** - 8:11:52 AM
Gareth Tucker am I good to do this ^^ and cause service interaction to -01 through reboots and upgrades ?

**Gareth Tucker** - 8:16:44 AM
I believe so, would like Daniel Iwan's input first though. Daniel Iwan all good from your side re: docker system prune?

**Daniel Iwan** - 8:44:02 AM
go ahead Jez Tucker, you may need to include -a  though otherwise not much will be free-d up

**Jez Tucker** - 8:44:30 AM
yes, was going baby steps first. starting now.
*Reactions: 👍*

**Jez Tucker** - 8:45:38 AM
5.315GB  it's like Christmas

**Orlando Richards** - 8:45:44 AM
Just reviewed the HW Lab - AI+ integration working perfectly!
*Reactions: 👍*

**Orlando Richards** - 8:47:36 AM
Hey Daniel Iwan - any way you can get rid of that stuck one?

*Attachments:*
- messageReference

**Daniel Iwan** - 8:51:46 AM
yeah, i'll delete it, need to stop metadata api

**Daniel Iwan** - 8:54:36 AM
should be done now

**Jez Tucker** - 8:58:14 AM
Daniel Iwan  -01 reboot time  + pixstor apply etc.  Will update when all is completed.
*Reactions: 👍, 👍*

**Jez Tucker** - 9:56:02 AM
Hub and worker are coming up.


Can you give your QA scripts a sanity run through.


I think we would benefit from a new pixstor alpha release at some near point.  Lots of twiddling to do, I think I have it all, but ~98% sure

**Jez Tucker** - 9:56:28 AM
of course, it's nearly 6pm, tomorrow am is also ok for doing this

**Gareth Tucker** - 9:56:44 AM
I will have a play now Jez

**Daniel Iwan** - 9:58:08 AM
hey Jez, what would be the quickest way to force ngenea rescan everything on the next run?

**Jez Tucker** - 9:58:25 AM
I also noticed the quotas were set to 1.0 on some spaces when the salt ran through.


for: sata1-ngeneabucketmanagerstoragetest-list  and sata1-ngeneabucketmanagerstoragetest-info


would be worth changing these to sensible

**Jez Tucker** - 9:58:33 AM
well. 2 ways.


1 touch all the files

**Jez Tucker** - 9:58:41 AM
2 we can rebaseline the snapshots

**Jez Tucker** - 9:58:49 AM
what's your preference

**Daniel Iwan** - 9:59:14 AM
how is the 2nd  done ?

**Jez Tucker** - 9:59:37 AM
stop the schedule


remove the snapshots in gpfs


remove the lock/rotate files


start the schedule

**Jez Tucker** - 9:59:47 AM
I can do the middle two if you do the first and last

**Jez Tucker** - 10:00:03 AM
that will need doing for each space

**Daniel Iwan** - 10:00:49 AM
that's ok, we may look into that in the future. I think touching will work for us since there's not much data atm

**Jez Tucker** - 10:02:12 AM
shall I add the 'open in hub' to the config ?


lucy tells me that this was a regression and should be resolved in the next dev release (i.e. the example you provided should work ..)
*Reactions: 👍*

**Gareth Tucker** - 10:02:56 AM
S'ok Jez, we can sort that

**Jez Tucker** - 10:03:05 AM
All good.

**Gareth Tucker** - 10:03:33 AM
Thanks for sorting the update on 01

**Jez Tucker** - 10:08:42 AM
Yep. Let me know if anything looks out of sorts and I'll make any required changes first thing in the am.

**Gareth Tucker** - 10:11:38 AM
No probs, having an issue with S3 uploads at the mo

**Gareth Tucker** - 10:11:49 AM
just trying to work out which side the issue is on

**Gareth Tucker** - 10:12:11 AM
we can save for the morning though

**Gareth Tucker** - 10:54:29 AM
Couple of things to look into in the morning please Jez on PixStor Dev 01


 


Uploads via Vision are failing with the following error


 



 


[Error] File: Sriracha_30.mp4 - Failed to upload chunk 1. Source: Http failure response for https://ca-sn-dev-01.om.cardifflab:7071/qa/Gareth/Sriracha_30.mp4?partNumber=1&uploadId=a3509323-daff-465e-b353-a893b0f9818c&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250901T170803Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Credential=YjOdY5dRBNqd9JnGEuLiBYQxQfFbBf7Q%2F20250901%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=53b97beb99ab974e2c8d9d5f2c1417b9f04bb240d84d846251af79cc2db168ab: 0 Unknown Error
 


and snapdiff is failing at the mo during filenotify with the following


 


 



 


{
  "url": "https://ca-sn-dev-01.om.cardifflab/api/tasks/483817/",
  "id": 483817,
  "task_id": "4519beb0-624a-4fa8-9ae4-472a7cbeedb1",
  "tasktype": "dynamo.tasks.vision.filenotify",
  "state": "FAILURE",
  "started": "2025-09-01T17:37:19.726946Z",
  "completed": "2025-09-01T17:37:19.719230Z",
  "runtime": 0,
  "job": 235534,
  "site": "ca-sn01",
  "paths": "https://ca-sn-dev-01.om.cardifflab/api/tasks/483817/files/",
  "parents": [],
  "dynamic_parents": [],
  "result": {
    "error": "NotRegistered: 'dynamo.tasks.vision.filenotify'"
  },
  "friendly_name": null
}

**Jez Tucker** - 12:53:21 PM
reminder to self for am. this node has been in the wars.  needs to have all the old schedules removed and re-added.

**Jez Tucker** - 1:26:10 PM
oo. I found a vision bug, maybe



try to upload a filefails with http message above due to backend serviceselect same file for upload in next attemptno action taken, immediately returns to viewer no upload attempted
*Reactions: 👍*

**Gareth Tucker** - 1:27:13 PM
Will get Bogdan Stanciu to take a look

**Jez Tucker** - 1:28:03 PM
I think I have sorted the schedules, left them at 1hr overnight so will review in am.


Family calls, so will give it all a close squinty eye with a brew tomorrow.

**Jez Tucker** - 1:28:31 PM
versity is still being odd, so upload issue should be currently reproducible

**Gareth Tucker** - 1:29:03 PM
Cheers Jez, have a good evening


## 9/2/2025

**Jez Tucker** - 1:15:00 AM
Bogdan Stanciu if you want to see if my issue is as I stated, then before 09:45 is good.  After that I'm going to start kicking the systems so we get back to working capability.

**Daniel Iwan** - 1:19:27 AM
I believe on our dev-02 we should have access to opensearch, however when I connect to https://ca-sn-dev-02.om.cardifflab:5601 to get to Dashboard I get 


 



 


* Host ca-sn-dev-02.om.cardifflab:5601 was resolved.
* IPv6: (none)
* IPv4: 10.20.0.162
*   Trying 10.20.0.162:5601...
* Connected to ca-sn-dev-02.om.cardifflab (10.20.0.162) port 5601
* ALPN: curl offers h2,http/1.1
* (304) (OUT), TLS handshake, Client hello (1):
* (304) (IN), TLS handshake, Server hello (2):
* (304) (IN), TLS handshake, Unknown (8):
* (304) (IN), TLS handshake, Certificate (11):
* (304) (IN), TLS handshake, CERT verify (15):
* (304) (IN), TLS handshake, Finished (20):
* (304) (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / AEAD-AES256-GCM-SHA384 / [blank] / UNDEF
* ALPN: server accepted http/1.1
* Server certificate:
*  subject: C=UK; ST=High Wycombe; L=Buckinghamshire; O=Pixit Media; OU=PD; CN=ca-sn-dev-02.pixstor
*  start date: Sep  1 12:40:24 2025 GMT
*  expire date: May 13 12:40:24 2134 GMT
*  issuer: C=UK; ST=High Wycombe; L=Buckinghamshire; O=Pixit Media; OU=PD; CN=pixstor-ca
*  SSL certificate verify result: self signed certificate in certificate chain (19), continuing anyway.
* using HTTP/1.x
> GET / HTTP/1.1
> Host: ca-sn-dev-02.om.cardifflab:5601
> User-Agent: curl/8.7.1
> Accept: */*
> 
* Request completely sent off
< HTTP/1.1 404 Not Found
< osd-name: osdb-ca-sn-dev-02
< content-type: application/json; charset=utf-8
< cache-control: private, no-cache, no-store, must-revalidate
< content-length: 60
< Date: Tue, 02 Sep 2025 08:18:36 GMT
< Connection: keep-alive
< Keep-Alive: timeout=120
< 
* Connection #0 to host ca-sn-dev-02.om.cardifflab left intact
{"statusCode":404,"error":"Not Found","message":"Not Found"}
any ideas?

**Gareth Tucker** - 1:20:22 AM
I can reproduce too so I will add a Jira on our side for Bogdan Stanciu

*Attachments:*
- messageReference

**Jez Tucker** - 1:27:09 AM
I'll get dev01 sorted first so QA can get on, then swing back to 02


Opensearch looks like it is not standing up, for "reasons"
*Reactions: 👍*

**Bogdan Stanciu** - 1:29:14 AM
Jez Tucker Sure, we can have a look whenever you've got some time

*Attachments:*
- messageReference

**Jez Tucker** - 1:48:54 AM
Can you please move out the "/mmfs1/data/qa/BenTest/100mb.md5" type files which cause run failures as we did per -02 so I can get a clean bill of health before you break it on purpose :-)

**Jez Tucker** - 1:50:05 AM
these are in space01 and qa

**Daniel Iwan** - 1:51:44 AM
I will do it

**Daniel Iwan** - 1:54:36 AM
done, there were couple of files in qa, nothing in space01

**Jez Tucker** - 1:55:32 AM
Thanks will turn up the schedules.

**Jez Tucker** - 1:59:24 AM
Daniel Iwan hopefully you should see rabbit messages as per normal

**Jez Tucker** - 1:59:58 AM
schedules are now every minute

**Jez Tucker** - 2:00:32 AM
this version does not have the patches in for the exiftool failure handling in, so that is still expected

**Jez Tucker** - 2:00:55 AM
E.G. Failed to process /mmfs1/data/qa/BenTest/Example Test Data/Dropspot v3.0.1.6 test data/testfile_1025byte: [Errno 1] Unspecified error

**Jez Tucker** - 2:01:27 AM
we are looking to get that all through and tested today/tomorrow

**Jez Tucker** - 2:03:13 AM
also, as quick user feedback, when the vision interface is in card mode, it may be worth presenting a hover for the filename if truncated as either you have to click each one to see, or flick to list mode and back again
*Reactions: 👍*

**Daniel Iwan** - 2:04:09 AM
sure, what resolution are you on Jez?

**Jez Tucker** - 2:05:06 AM
1920x1200, browser zoom 90%, chromium
*Reactions: 👍*

**Daniel Iwan** - 2:05:40 AM
I see one with ellipsis on mine as well, I will log that

**Daniel Iwan** - 2:06:32 AM
I see rabbits are coming in very quickly, we will keep an eye on it, thanks Jez

**Jez Tucker** - 2:06:40 AM
user story screenshot:

*Attachments:*
- which_is_the_screen_recording_I_am_looking_for.png
*Reactions: 👍*

**Jez Tucker** - 2:07:01 AM
ok. am going to re-upload a 3rd screen recording movie to test the versity

**Gareth Tucker** - 2:08:20 AM
this folder is going to cause probs too

**Gareth Tucker** - 2:08:25 AM


**Gareth Tucker** - 2:08:29 AM
I will remove

**Gareth Tucker** - 2:09:50 AM
and the football.ts files

**Gareth Tucker** - 2:09:55 AM
both have now been removed

**Gareth Tucker** - 2:10:05 AM
that should help quiten down the events

**Gareth Tucker** - 2:16:02 AM
there was a football.ts hiding in space01 as well which may have caused problems with exiftool, that has also been removed

**Jez Tucker** - 2:19:43 AM
ok. I think the versity is a different issue.


I have successfully uploaded /space01/Screen Recording 2025-06-06 at 16.11.58 jez.mov


the md5sum is correct


but the activity monitor has it as failed


however, versity is returning 200s


 


end of upload:


 



 


Sep 02 10:17:40 ca-sn-dev-01 versitygw-iris[1086913]: 10:17:32 | 200 |  7.118228078s | 10.222.222.1 | PUT | /space01/Screen Recording 2025-06-06 at 16.11.58 jez.mov | - | partNumber=112&uploadId=786065f2-eb82-45f3-a983-335a9574100e&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250902T091732Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Credential=YjOdY5dRBNqd9JnGEuLiBYQxQfFbBf7Q%2F20250902%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=64ac562e30a0d2a5d317bf7821470a5dd1285e3b40559de8234588f46f45f2ac
Sep 02 10:17:40 ca-sn-dev-01 versitygw-iris[1086913]: 10:17:33 | 200 |  6.666174968s | 10.222.222.1 | PUT | /space01/Screen Recording 2025-06-06 at 16.11.58 jez.mov | - | partNumber=113&uploadId=786065f2-eb82-45f3-a983-335a9574100e&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250902T091733Z&X-Amz-SignedHeaders=host&X-Amz-Expires=1200&X-Amz-Credential=YjOdY5dRBNqd9JnGEuLiBYQxQfFbBf7Q%2F20250902%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Signature=0a654e63df787f2ba54b2aefae483cc385319d1d27726b8527d5eb387864ed55
Sep 02 10:17:52 ca-sn-dev-01 versitygw-iris[1086913]: 10:17:40 | 200 | 12.530911151s | 10.222.222.1 | POST | /space01/Screen Recording 2025-06-06 at 16.11.58 jez.mov | - | uploadId=786065f2-eb82-45f3-a983-335a9574100e
Sep 02 10:17:53 ca-sn-dev-01 versitygw-iris[1086913]: 10:17:52 | 200 |    1.077847ms | 10.222.222.1 | HEAD | /space01/Screen Recording 2025-06-06 at 16.11.58 jez.mov | - |

**Jez Tucker** - 2:20:35 AM
so; what check does the activity monitor do which would be causing us to see 'failed' ?

**Jez Tucker** - 2:20:47 AM
"[Error] File: Screen Recording 2025-06-06 at 16.11.58 jez.mov - undefined"

**Jez Tucker** - 2:21:41 AM
I propose to leave that with for a bit (I think it's your standup time) and I will switch over to -02

**Jez Tucker** - 2:44:54 AM
Is anyone applying salt states on -01 ?


I can see things I have set being reverted.

**Daniel Iwan** - 2:57:23 AM
nothing on our end I think

**Jez Tucker** - 3:00:52 AM
v.strange.


ok. please have a pootle around -01 and -02


do not apply salt states as there are 3x configs which differ from the standard pixstor deployment


I will write these down in your confluence


 


-01 has the observable upload issue, above


-02 needs the permissions json update
*Reactions: 👍*

**Gareth Tucker** - 3:19:00 AM
Cheers Jez, we will work our way through and let you know if we spot any issues

**Gareth Tucker** - 3:49:33 AM
Jez Tucker re: 02 needs the permissions json update


 


Polly Miller has resolved the issue that was preventing us listing spaces yesterday. A quick run through including logging in as pixadmin looks to be behaving as expected so far.


 


Are there any further basic tests we need to complete re: Keycloak login to confirm that things look to be there or there about from your side now that we are past the permissions parsing issue?

**Jez Tucker** - 3:53:26 AM
That's going to need a Nonso's input.


I know we wanted to demonstrate the token removal process e2e as we think there may be more work to do in vision re: token cancellation.


 


Let me circle back post lunch and get the low down.


 


Also; we have just found a hub issue whereby the space state was not being completely set correctly, so I am manually patching the iris enabled spaces on the backend.  As the space was not in sync, the salt state is running hourly to run the iris state, which resets my manual changes.  P1 ticket is in for next dev rev.   


 


Once I've done this for the interim, we'll need to hand mod spaces which are then iris enabled/disabled.  Expecting any of these changes this week?

**Gareth Tucker** - 3:59:17 AM
Adding new spaces or disabling Iris? if so, unlikely

**Jez Tucker** - 4:07:28 AM
-01 is patched up, I will do -02 then redo my manual changes to the systemd files on both
*Reactions: 👍*

**Jez Tucker** - 4:17:50 AM
ok. I believe we are good on both systems now so going to grab a bite.


I will look again just after the hour when any periodical changes might be made
*Reactions: 👍*

**Jez Tucker** - 4:19:43 AM
though I also note that on that on -02 the failed to upload chunk is present

**Jez Tucker** - 4:20:31 AM
will have a look at that asap (post lunch)

**Daniel Iwan** - 4:20:52 AM
ok, we had some suspicions about certificates but CA should not change on any of those systems correct?

**Gareth Tucker** - 4:25:50 AM
on the topic of ssl, Vision and Versity are not currently using the same cert on 01, so you have to accept it twice before you will see proxies etc

**Jez Tucker** - 5:10:09 AM
ok. cert wise, Orlando Richards can you have a quick peeky at that one ?

**Jez Tucker** - 5:23:12 AM
ok. versity wise on -02, it happily supports a direct aws s3 cp of the Siracha file which is otherwise failing through Vision upload.


both directly to its own port 7070 and to nginx fronted 7071

**Gareth Tucker** - 5:25:23 AM
is that using a single PUT or a multi-part upload?

**Gareth Tucker** - 5:25:29 AM
Vision is doing the latter

**Jez Tucker** - 5:25:52 AM
might be worth making your space name boxes larger.  on the drop down you have a large area you could expand rightwards into

*Attachments:*
- space_drop_down_wrap.png

**Jez Tucker** - 5:26:01 AM
let me check that

*Attachments:*
- messageReference

**Gareth Tucker** - 5:29:06 AM
that will hopefully be a quick change. Bogdan Stanciu please create a Jira if it is not

*Attachments:*
- messageReference
*Reactions: 👍*

**Jez Tucker** - 5:46:09 AM
yes. I can confirm that cli testing with MPU checks out fine.


uploads through UI not so.


 


would someone like to be secondary eyes to confirm I am not being an idgit ?

**Jez Tucker** - 5:54:53 AM
cli test on -02:


 



 


aws s3 cp --debug  --no-verify-ssl --endpoint-url https://localhost:7071 /root/part1_jez.mov s3://space01/part1_jez.mov
which resulted in:


 



 


Sep 02 13:53:31 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |   82.673301ms | 10.222.222.2 | POST | /space01/part1_jez.mov | - | uploads
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  970.223266ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=1
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  935.153035ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=7
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  970.071087ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=2
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  958.944001ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=6
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  956.247101ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=4
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  948.255977ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=9
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  908.585373ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=8
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  976.277779ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=3
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  1.035103724s | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=5
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:31 | 200 |  997.181206ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=10
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:32 | 200 |  156.418212ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=14
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:32 | 200 |  318.170279ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=12
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:32 | 200 |    298.8696ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=11
Sep 02 13:53:33 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:32 | 200 |  318.650931ms | 10.222.222.2 | PUT | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854&partNumber=13
Sep 02 13:53:34 ca-sn-dev-02 versitygw-iris[3397555]: 13:53:33 | 200 |  772.142287ms | 10.222.222.2 | POST | /space01/part1_jez.mov | - | uploadId=a684e5e9-6aa2-436e-a89e-5843b094b854
Sep 02 13:54:11 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:11 | 200 |    2.071966ms | 10.222.222.2 | HEAD | /space01/part1_jez.mov | - |
Sep 02 13:54:21 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:20 | 200 |    1.739642ms | 10.222.222.2 | HEAD | /space01/part1_jez.mov | - |
Sep 02 13:54:21 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:21 | 200 |    1.802139ms | 10.222.222.2 | HEAD | /space01/part1_jez.mov | - |
Sep 02 13:54:21 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:21 | 404 |     570.049µs | 10.222.222.2 | GET | /space01/.metadata/ai-plus/object-detection/part1_jez.mov.metadata.json | - |
Sep 02 13:54:21 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:21 | 404 |     400.964µs | 10.222.222.2 | GET | /space01/.metadata/ai-plus/summarize/part1_jez.mov.metadata.json | - |
Sep 02 13:54:21 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:21 | 404 |     399.405µs | 10.222.222.2 | GET | /space01/.metadata/ai-plus/facial-recognition/part1_jez.mov.metadata.json | - |
Sep 02 13:54:21 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:21 | 200 |    1.622913ms | 10.222.222.2 | HEAD | /space01/part1_jez.mov | - |
Sep 02 13:54:22 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:21 | 200 |    1.517791ms | 10.222.222.2 | HEAD | /space01/part1_jez.mov | - |
Sep 02 13:54:22 ca-sn-dev-02 versitygw-iris[3397555]: 13:54:21 | 206 |     1.79563ms | 10.222.222.2 | GET | /space01/part1_jez.mov | - | X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Date=20250902T125422Z&X-Amz-SignedHeaders=host&X-Amz-Credential=sdJIldoqTXBMa0w5mQzwQZiF2KaVGeTo%2F20250902%2Fus-east-1%2Fs3%2Faws4_request&X-Amz-Expires=86400&X-Amz-Signature=eed152645642e20ab715aef79aae7ea92b62d9ad0b6665b8dfd9a177eb847535

**Jez Tucker** - 6:06:57 AM
Gareth Tucker the one thing we wanted to show/see is that we think when you log out of hub, vision should also be logged out (and visa-versa).  Would be good to run through that flow.

*Attachments:*
- messageReference

**Gareth Tucker** - 6:28:19 AM
Vision uploads appear to be OK Jez Tucker at the moment on 01. Could one of this morning's updates have resolved that?

*Attachments:*
- messageReference

**Jez Tucker** - 6:28:52 AM
Gimme ~15 mins and we can go through some things
*Reactions: 👍*

**Jez Tucker** - 6:29:25 AM
ok. let's catch up after that then

**Orlando Richards** - 6:57:07 AM
Found a bug in the way it validates whether is should manage arcapix.crt. - an upgrade to salt has changed the info keys in the certs from Capitalised to uncapitalised. I'll get it to regenerate the certs now

*Attachments:*
- messageReference

**Orlando Richards** - 6:59:02 AM
Changes made:


 



 


----------
          ID: /etc/versitygw.d/iris.conf
    Function: file.managed
      Result: True
     Comment: File /etc/versitygw.d/iris.conf updated
     Started: 14:57:42.439491
    Duration: 51.254 ms
     Changes:
              ----------
              diff:
                  ---
                  +++
                  @@ -6,7 +6,7 @@
                   VGW_PORT="0.0.0.0:7070"
                   VGW_ADMIN_PORT="127.0.0.1:27070"
                   VGW_BACKEND="ngenea"
                  -VGW_BACKEND_OPTS="--bucketlinks --hash512 present"
                  +VGW_BACKEND_OPTS="--bucketlinks"
                   VGW_BACKEND_ARG="/var/lib/pixstor/versity/iris_root"
                   VGW_CERT="/etc/pki/tls/certs/pixstor.crt"
                   VGW_KEY="/etc/pki/tls/private/pixstor.key"
----------
----------
          ID: /var/lib/pixstor/iris/mcs-runtime/mcs-vision-api/config/ngenea-beta.properties
    Function: file.managed
      Result: True
     Comment: File /var/lib/pixstor/iris/mcs-runtime/mcs-vision-api/config/ngenea-beta.properties updated
     Started: 14:57:46.861703
    Duration: 60.899 ms
     Changes:
              ----------
              diff:
                  ---
                  +++
                  @@ -10,12 +10,6 @@
                   mcs.beta.ngenea.workflows[1].label: Recall
                   mcs.beta.ngenea.workflows[1].discovery: recursive
                   mcs.beta.ngenea.workflows[1].icon-name: unarchive
                  -mcs.beta.ngenea.workflows[2].id: 2
                  -mcs.beta.ngenea.workflows[2].name: open_in_hub
                  -mcs.beta.ngenea.workflows[2].label: Open in Hub
                  -mcs.beta.ngenea.workflows[2].discovery: recursive
                  -mcs.beta.ngenea.workflows[2].icon-name: open_in_browser
                  -mcs.beta.ngenea.workflows[2].redirect-url: ${hub_host}/spaces?space={space_name}&path={mountpoint}/{parent_path}
                   mcs.beta.ngenea.baseUrl: https://10.222.222.1/api
                   mcs.beta.ngenea.apiKey: 1l7ucJZW.MEp3Hrv03AuzeAWp7PbHUs8ZCWGOEGok
                   mcs.beta.ngenea.mountPoint: /mmfs1/data
----------
          ID: /var/lib/pixstor/iris/mcs-runtime/mcs-nginx/nginx/tls/tls.crt
    Function: file.managed
      Result: True
     Comment: File /var/lib/pixstor/iris/mcs-runtime/mcs-nginx/nginx/tls/tls.crt updated
     Started: 14:57:51.033881
    Duration: 51.508 ms
     Changes:
              ----------
              diff:
                  <show_changes=False>
----------
          ID: /var/lib/pixstor/iris/mcs-runtime/mcs-nginx/nginx/tls/tls.key
    Function: file.managed
      Result: True
     Comment: File /var/lib/pixstor/iris/mcs-runtime/mcs-nginx/nginx/tls/tls.key updated
     Started: 14:57:51.085817
    Duration: 14.637 ms
     Changes:
              ----------
              diff:
                  <show_changes=False>
----------
          ID: /etc/ngenea/iris-rabbitmq.yaml
    Function: file.managed
      Result: True
     Comment: File /etc/ngenea/iris-rabbitmq.yaml updated
     Started: 14:57:52.901001
    Duration: 130.218 ms
     Changes:
              ----------
              diff:
                  ---
                  +++
                  @@ -9,22 +9,12 @@
                     client_cert_path: /var/lib/pixstor/iris/mcs-runtime/mcs-core/rabbitmq/tls/tls.crt
                     client_key_path: /var/lib/pixstor/iris/mcs-runtime/mcs-core/rabbitmq/tls/tls.key
                     virtual_host: /
                  -publishers:
                  -  exiftool:
                  -    exchange_name: vision-metadata-xchg
                  +publishers:
                     filenotify:
                       exchange_name: pixstor-fs-events-xchg
                     mediainfo:
                       exchange_name: vision-metadata-xchg
                  -error_handling:
                  -  on_error_set_aborted: true
                  -  exiftool:
                  -    on_error_set_aborted: true
                  -  mediainfo:
                  -    on_error_set_aborted: true
                   messages:
                  -  exiftool:
                  -    endpoint_url: https://10.222.222.1:7070
                     filenotify:
                       endpoint_url: https://10.222.222.1:7070
                     mediainfo:
 
Jez Tucker, do you need to redo any of those?

**Orlando Richards** - 7:00:44 AM
/jira create

**Orlando Richards** - 7:00:46 AM
oh

**Orlando Richards** - 7:00:47 AM
teams

**Orlando Richards** - 7:01:47 AM
https://arcapix.atlassian.net/browse/RNDPIX-13002

**Jamie Sabino** - 8:25:08 AM
Orlando Richards tried both when i was trying (confluence says to use IP btw). It's definitely working today.  As an FYI, wycombe ai+ node is being worked on for the admin gui issue.

*Attachments:*
- messageReference

**Orlando Richards** - 8:26:01 AM
which confluence page says to use the IP?

**Orlando Richards** - 8:26:46 AM
all the ones I've been able to find say to use the hostname

**Jamie Sabino** - 8:31:10 AM
https://arcapix.atlassian.net/wiki/spaces/Labs/pages/5060362264/HW+Prod+Cluster+-+Iris

*Attachments:*
- Screenshot 2025-09-02 at 11.30.30 AM.png

**Orlando Richards** - 8:38:09 AM
dang

**Orlando Richards** - 8:38:10 AM
thanks

**Orlando Richards** - 8:38:26 AM
fixed

**Orlando Richards** - 8:53:54 AM
Gareth TuckerDaniel Iwan - got an ETA on a new vision installer bundle with all the above stuff folded in?

**Daniel Iwan** - 9:09:08 AM
Gareth Tucker we likely want to include latest changes from Bogdan?

**Gareth Tucker** - 9:24:23 AM
Yeah, that would be preferred

**Gareth Tucker** - 9:24:36 AM
He had a build coming tomorrow with filtering improvements

**Gareth Tucker** - 9:24:50 AM
And another later in the week with rbac 🤞

**Jez Tucker** - 9:31:21 AM
qu. is there a way to hide the .snapshots folder in the vision UI ?

**Jez Tucker** - 9:32:18 AM
or FRQ


hide some items by pixit choice


and also have a 'show/hide hidden items', which start with a .

**Daniel Iwan** - 9:32:53 AM
I don't think there is. Possibly should be excluded in versitygw as well, but I'm not sure if there is any way to do that?

**Jez Tucker** - 9:39:36 AM
I will have a look

**Gareth Tucker** - 9:40:59 AM
We do hide some stuff by choice, like .metadata and . resources but that may be hard coded during listing

**Gareth Tucker** - 11:26:05 AM
Jamie Sabino in addition to the missing Transcribe & Summarize values that you are looking into for me on PixStor Dev 01 in Cardiff, could you also please take a look at our config for the "qa" space if you get a chance during your day.


 


I have mirrored what is set up for "space01", with the intention to process all objects in the "qa" space, but when I drop files I get the a "422 Unprocessable Entity" error in the T&S logs. The same file gets further when dropped into "space01" but suffers with keywords/summary missing values as mentioned direct and touched on above.


 


QA are ready to test transcription display on our side but we'll need to get past these issues to get them going please with your help. Thanks.


 






 


{"filename": "http_logger.py", "func_name": "dispatch", "lineno": 48, "event": "HTTP Request", "timestamp": "2025-09-02 18:06:11", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "134356632946160", "HttpMethod": "POST", "URL": "http://0.0.0.0:9003/process", "HttpHeaders": {"user-agent": "python-httpx/0.28.1", "x-correlation-id": "a3640d65-c1f2-456d-96c8-5d8ab816e9f1"}, "HttpRequestBody": {"job_id": "50b9fd71-b48f-44c5-add6-8efad3f32b52", "media_file": "qa/Gareth/Sriracha_30_2025090219.mp4", "processing_type": "Queue", "callback_url": "rabbitmq://", "config": {"model": "llama3.1:8b", "transcriber": "whisper"}, "queue_metadata": {"fsInode": {"fsid": "10848671671403863553", "ino": "1836432", "igen": "407458689"}, "s3object": {"endpointUrl": "https://10.222.222.1:7070", "bucket": "qa", "key": "Gareth/Sriracha_30_2025090219.mp4", "etag": ":10848671671403863553:1836432:407458689"}}, "tenant_id": "iris"}, "log_level": "INFO", "log_channel": "aiplus.core.log.http"}
{"filename": "http_logger.py", "func_name": "dispatch", "lineno": 93, "event": "HTTP Response", "timestamp": "2025-09-02 18:06:11", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "134356632946160", "HttpStatusCode": 422, "HttpResponseBody": {"detail": [{"loc": ["body", "config", "prompts"], "msg": "field required", "type": "value_error.missing"}]}, "ProcessingTime": "0.004s", "log_level": "INFO", "log_channel": "aiplus.core.log.http"}
INFO:     127.0.0.1:54176 - "POST /process HTTP/1.1" 422 Unprocessable Entity

**Jamie Sabino** - 11:50:56 AM
Gareth Tucker will have a look, i think that error is likely around the nfs mount isn't showing that new location properly.. tbd.. but ack on the above ^ still working on Wycombe
*Reactions: 👍*

**Jamie Sabino** - 12:12:26 PM
Gareth Tucker et Everyone in QA using Cardiff, i'll be restarting some services in ai+ consider it down for now until i get the issues resolved.. We had a service get knocked out and debugging that at the moment
*Reactions: 👍*

**Gareth Tucker** - 12:17:14 PM
No probs Jamie, all yours, keep us posted please

**Jamie Sabino** - 1:05:38 PM
unable to upload anything, getting 500 error to test out the workflow, is this a known issue or seen before?

*Attachments:*
- Screenshot 2025-09-02 at 4.04.48 PM.png

**Jamie Sabino** - 1:10:33 PM
root@ca-sn-dev-01:/mmfs1/data/space01 # cp 001-jsabinoTest.mp4 001-js1.mp4

cp: error writing '001-js1.mp4': No space left on device

[Px] Staging mode     [Px]

**Jamie Sabino** - 1:10:50 PM
Gareth Tucker ^ i think that's behind it,

**Gareth Tucker** - 1:17:45 PM
That looks new Jamie, probably just been tipped over the edge with testing following upgrades
*Reactions: 👍*

**Jamie Sabino** - 1:21:34 PM
the "file not found" error , will see what i can debug on the other issue without this working, May have some help early morning UK time with Ankit Josh(IC) and or Arunita sahu(IC) to quickly get us back on track here in cardiff, i'll update accordingly here

**Gareth Tucker** - 1:35:18 PM
ok, thanks for the update Jamie. We will take a look in to the space issue in the morning. Looks like we will need help from Jez / Orlando.


## 9/3/2025

**Gareth Tucker** - 12:55:55 AM
Jez Tucker Orlando Richards could we get some help on Dev 01 when you have a moment please re: "No space left on device" that Jamie reported last night.

**Orlando Richards** - 12:56:59 AM
I'll have a squizz
*Reactions: 👍*

**Orlando Richards** - 12:57:16 AM
could be that quota thing Jez mentioned?

**Orlando Richards** - 12:57:58 AM
hmm, nope

**Orlando Richards** - 12:58:34 AM
Your pool is full:






 


root@ca-sn-dev-01:/mmfs1/data/space01 # mmlspool mmfs1
Storage pools in file system at '/mmfs1':
Name                    Id   BlkSize Data Meta Total Data in (KB)   Free Data in (KB)   Total Meta in (KB)    Free Meta in (KB)
system                   0    512 KB   no  yes              0              0 (  0%)       10485760        7401984 ( 71%)
sata1                65537      8 MB  yes   no       62914560              0 (  0%)              0              0 (  0%)
sata2                65538      8 MB  yes   no       62914560       62750720 (100%)              0              0 (  0%)

**Orlando Richards** - 12:58:47 AM
you have the "standard" dev profile of two data pools, to allow for development of pool tiering

**Orlando Richards** - 12:59:04 AM
Jez Tucker - do you think they should keep that, or merge the pools?

**Orlando Richards** - 12:59:28 AM
you can also just clear up some data  Gareth Tucker

**Gareth Tucker** - 12:59:43 AM
I did try a little just to see if it had any effect

**Gareth Tucker** - 12:59:49 AM
maybe I didn't try hard enough

**Gareth Tucker** - 1:00:20 AM
is it just what is in /mmfs1 and beneath that would matter? or does anywhere count e.g. user home directory etc?

**Orlando Richards** - 1:17:38 AM
mmfs1 only

**Orlando Richards** - 1:17:54 AM
there may be snapshots holding up the space if you delete stuff though

**Gareth Tucker** - 1:21:00 AM
yeah, just removed 3-4GB but no change, not immediate anyway

**Orlando Richards** - 1:23:03 AM
just confirmed with Jez - he's got no particular desire to leave you with multiple pools, so I'll get them merged - that'll effectively double your capacity

**Jez Tucker** - 1:23:55 AM
be aware that some spaces might be set to specific pools and might need changing if you alter them (preflight check..)

**Orlando Richards** - 1:24:12 AM
Gonna delete this file: 



 


/mmfs1/data/curlspacestest2/Perifery-Desktop-Background.png

**Orlando Richards** - 1:26:25 AM
And this snapshot: 



 


sata2-curlspacestest2:ngenea-worker.snapdiff.schd.schedule-iris-notify-curlspacestest2-ca-sn01.1756842901.164892

**Orlando Richards** - 1:26:48 AM
that's the one jez said
*Reactions: 👍*

**Orlando Richards** - 1:28:54 AM
Done: 



 


root@ca-sn-dev-01:~ # mmlspool mmfs1
Storage pools in file system at '/mmfs1':
Name                    Id   BlkSize Data Meta Total Data in (KB)   Free Data in (KB)   Total Meta in (KB)    Free Meta in (KB)
system                   0    512 KB   no  yes              0              0 (  0%)       10485760        7421952 ( 71%)
sata1                65537      8 MB  yes   no      125829120       62750720 ( 50%)              0              0 (  0%)

**Orlando Richards** - 1:29:16 AM
Gareth Tucker - at some point, you'll want to get the other dev nodes aligned with that I imagine - but that'll get you unblocked for now.

**Gareth Tucker** - 1:37:35 AM
great, thanks Orlando. I can confirm that I no longer have any space errors when writing to mmfs1

**Gareth Tucker** - 1:54:30 AM
FYI, Vision was getting errors when listing spaces, saying curlspacestest2 did not exist, so I have turned off Iris for that Space in Hub

**Daniel Iwan** - 2:12:00 AM
one more to address which is receiving fs events on the loop, possibly due to jobs failing






 


{
  "url": "https://ca-sn-dev-01.om.cardifflab/api/tasks/509971/",
  "id": 509971,
  "task_id": "c5a9f995-04b2-4051-89a4-5149199f6a8c",
  "tasktype": "dynamo.tasks.iris.exiftool",
  "state": "ERROR",
  "started": "2025-09-03T09:08:42.977600Z",
  "completed": "2025-09-03T09:08:44.104305Z",
  "runtime": 1.126705,
  "job": 243999,
  "site": "ca-sn01",
  "paths": "https://ca-sn-dev-01.om.cardifflab/api/tasks/509971/files/",
  "parents": [],
  "dynamic_parents": [],
  "result": {
    "log": [],
    "skip": false,
    "jobid": 243999,
    "paths": [
      {
        "path": "/mmfs1/data/space01/Gareth/Sriracha_60_2025090301.mp4"
      },
      {
        "path": "/mmfs1/data/space01/Gareth/Sriracha_30_2025090301.mp4"
      },
      {
        "path": "/mmfs1/data/space01/Daniel/Sriracha_30_2025082202.mp4"
      }
    ],
    "queue": "ca-sn01#custom",
    "status": {
      "task": "dynamo.tasks.iris.exiftool",
      "details": {
        "aborted": [],
        "skipped": [],
        "failures": [
          {
            "path": "/mmfs1/data/space01/Gareth/Sriracha_60_1.mp4",
            "message": [
              "[Errno 1] Unspecified error"
            ]
          },
          {
            "path": "/mmfs1/data/space01/001-js1.mp4",
            "message": [
              "[Errno 1] Unspecified error"
            ]
          },
          {
            "path": "/mmfs1/data/space01/002-js1.mp4",
            "message": [
              "[Errno 1] Unspecified error"
            ]
          },
          {
            "path": "/mmfs1/data/space01/orichards.mp4",
            "message": [
              "[Errno 1] Unspecified error"
            ]
          }
        ],
        "processed": [
          {
            "path": "/mmfs1/data/space01/Gareth/Sriracha_60_2025090301.mp4"
          },
          {
            "path": "/mmfs1/data/space01/Gareth/Sriracha_30_2025090301.mp4"
          },
          {
            "path": "/mmfs1/data/space01/Daniel/Sriracha_30_2025082202.mp4"
          }
        ],
        "inprogress": []
      },
      "started": "2025-09-03T09:08:42.977600+00:00",
      "summary": {
        "aborted": 0,
        "skipped": 0,
        "failures": 4,
        "processed": 3,
        "inprogress": 0
      },
      "input_paths": [
        {
          "path": "/mmfs1/data/space01/Gareth/Sriracha_60_2025090301.mp4"
        },
        {
          "path": "/mmfs1/data/space01/Gareth/Sriracha_30_2025090301.mp4"
        },
        {
          "path": "/mmfs1/data/space01/Daniel/Sriracha_30_2025082202.mp4"
        },
        {
          "path": "/mmfs1/data/space01/Gareth/Sriracha_60_1.mp4"
        },
        {
          "path": "/mmfs1/data/space01/001-js1.mp4"
        },
        {
          "path": "/mmfs1/data/space01/002-js1.mp4"
        },
        {
          "path": "/mmfs1/data/space01/orichards.mp4"
        }
      ],
      "input_total": 7
    },
    "chain_details": {
      "all_fail": [
        {
          "path": "/mmfs1/data/space01/Gareth/Sriracha_60_1.mp4",
          "message": [
            "[Errno 1] Unspecified error"
          ]
        },
        {
          "path": "/mmfs1/data/space01/001-js1.mp4",
          "message": [
            "[Errno 1] Unspecified error"
          ]
        },
        {
          "path": "/mmfs1/data/space01/002-js1.mp4",
          "message": [
            "[Errno 1] Unspecified error"
          ]
        },
        {
          "path": "/mmfs1/data/space01/orichards.mp4",
          "message": [
            "[Errno 1] Unspecified error"
          ]
        }
      ],
      "all_skip": []
    }
  },
  "friendly_name": null
}

**Daniel Iwan** - 2:31:53 AM
all caused by 0 bytes files from failed uploads

**Jez Tucker** - 2:57:37 AM
that's not in the release you have. tickets are in active QA
*Reactions: 👍*

**Gareth Tucker** - 3:55:58 AM
Jamie Sabino Ankit Josh(IC) Arunita sahu(IC) with the disk space issues resolved now on PixStor Dev 01, could we please resume investigation on getting AI+ to process content in the "qa" Space. It looks like we are still facing the same issue that I reported yesterday.


 


Notification API is complaining about failing to route content to T&S when it processes new files


 



 


"Failed to route to TranscribeSummarize: HTTP 422"
 


Full log output below


 



 


{"filename": "consumerHandler.py", "func_name": "message_handler", "lineno": 93, "event": "Processing FileCreated event", "timestamp": "2025-09-03 10:43:12", "ComponentName": "NotificationAPI", "ThreadName": "MainThread", "TaskId": "124061843897856", "CorrelationId": "1c472a4d-0607-4510-b8d5-94ea8b846bfb", "log_level": "INFO", "log_channel": "aiplus.core.queue.consumerHandler"}
{"filename": "httpClientManager.py", "func_name": "_prepare_http_request_logging", "lineno": 517, "event": "HTTP Outbound Request", "timestamp": "2025-09-03 10:43:12", "ComponentName": "NotificationAPI", "ThreadName": "MainThread", "TaskId": "124061843897856", "CorrelationId": "1c472a4d-0607-4510-b8d5-94ea8b846bfb", "HttpMethod": "POST", "URL": "http://0.0.0.0:9003/process", "HttpRequestBody": {"job_id": "18aac4bb-97e1-4edb-bdcf-0e3f0b3a20cd", "media_file": "qa/Gareth/Sriracha_30_2025090303.mp4", "processing_type": "Queue", "callback_url": "rabbitmq://", "config": {"model": "llama3.1:8b", "transcriber": "whisper"}, "queue_metadata": {"fsInode": {"fsid": "10848671671403863553", "ino": "1836440", "igen": "1585788848"}, "s3object": {"endpointUrl": "https://10.222.222.1:7070", "bucket": "qa", "key": "Gareth/Sriracha_30_2025090303.mp4", "etag": ":10848671671403863553:1836440:1585788848"}}, "tenant_id": "iris"}, "log_level": "INFO", "log_channel": "aiplus.core.http.httpClientManager"}
{"filename": "httpClientManager.py", "func_name": "_log_http_response", "lineno": 532, "event": "HTTP Outbound Response", "timestamp": "2025-09-03 10:43:12", "ComponentName": "NotificationAPI", "ThreadName": "MainThread", "TaskId": "124061843897856", "CorrelationId": "1c472a4d-0607-4510-b8d5-94ea8b846bfb", "HttpStatusCode": 422, "HttpResponseBody": {"detail": [{"loc": ["body", "config", "prompts"], "msg": "field required", "type": "value_error.missing"}]}, "ProcessingTime": "0.012s", "log_level": "INFO", "log_channel": "aiplus.core.http.httpClientManager"}
{"filename": "iris_service.py", "func_name": "_route_to_service", "lineno": 486, "event": "Failed to route to TranscribeSummarize: HTTP 422", "timestamp": "2025-09-03 10:43:12", "ComponentName": "NotificationAPI", "ThreadName": "MainThread", "TaskId": "124061843897856", "CorrelationId": "1c472a4d-0607-4510-b8d5-94ea8b846bfb", "log_level": "ERROR", "log_channel": "notification_api.services.iris_service"}
{"filename": "consumerHandler.py", "func_name": "message_handler", "lineno": 104, "event": "Failed to process FileCreated event: Failed to route to any services", "timestamp": "2025-09-03 10:43:12", "ComponentName": "NotificationAPI", "ThreadName": "MainThread", "TaskId": "124061843897856", "CorrelationId": "1c472a4d-0607-4510-b8d5-94ea8b846bfb", "log_level": "WARNING", "log_channel": "aiplus.core.queue.consumerHandler"}
 


and T&S shows the "422 Unprocessable Entity" error I shared yesterday also copied below for convenience


 






 


{"filename": "http_logger.py", "func_name": "dispatch", "lineno": 48, "event": "HTTP Request", "timestamp": "2025-09-03 10:43:12", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "128146524731888", "HttpMethod": "POST", "URL": "http://0.0.0.0:9003/process", "HttpHeaders": {"user-agent": "python-httpx/0.28.1", "x-correlation-id": "1c472a4d-0607-4510-b8d5-94ea8b846bfb"}, "HttpRequestBody": {"job_id": "18aac4bb-97e1-4edb-bdcf-0e3f0b3a20cd", "media_file": "qa/Gareth/Sriracha_30_2025090303.mp4", "processing_type": "Queue", "callback_url": "rabbitmq://", "config": {"model": "llama3.1:8b", "transcriber": "whisper"}, "queue_metadata": {"fsInode": {"fsid": "10848671671403863553", "ino": "1836440", "igen": "1585788848"}, "s3object": {"endpointUrl": "https://10.222.222.1:7070", "bucket": "qa", "key": "Gareth/Sriracha_30_2025090303.mp4", "etag": ":10848671671403863553:1836440:1585788848"}}, "tenant_id": "iris"}, "log_level": "INFO", "log_channel": "aiplus.core.log.http"}
{"filename": "http_logger.py", "func_name": "dispatch", "lineno": 93, "event": "HTTP Response", "timestamp": "2025-09-03 10:43:12", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "128146524731888", "HttpStatusCode": 422, "HttpResponseBody": {"detail": [{"loc": ["body", "config", "prompts"], "msg": "field required", "type": "value_error.missing"}]}, "ProcessingTime": "0.004s", "log_level": "INFO", "log_channel": "aiplus.core.log.http"}
INFO:     127.0.0.1:46210 - "POST /process HTTP/1.1" 422 Unprocessable Entity

*Attachments:*
- messageReference

**Gareth Tucker** - 3:57:48 AM
Jamie Sabino side note, the missing values for keywords and summary is now resolved at the moment on PixStor Dev 01, suggesting that your ollama fixes / restart resolved that.

**Jamie Sabino** - 5:59:59 AM
Gareth Tucker ack^ on the right track.  Will look at the QA bucket issue this morning
*Reactions: 👍*

**Ankit Josh(IC)** - 6:17:53 AM
Unprocessable Entity was due to the formatting of the payload if I remember correctly. Justin Toribio

*Attachments:*
- messageReference
*Reactions: 👍*

**Ankit Josh(IC)** - 6:18:18 AM
I'll look into it Gareth Tucker

*Attachments:*
- messageReference
*Reactions: 👍*

**Jamie Sabino** - 6:19:00 AM
there's a JIra on it Ankit Josh(IC) i raised yesterday, even if so, we processed the Transcription, need to reproduce it and handle it properly
*Reactions: 👍*

**Jamie Sabino** - 6:19:52 AM
i'm jumping on cardiff now, Gareth Tucker please confirm nothing has changed on configuring the prompt(s) etc..

**Gareth Tucker** - 6:22:45 AM
just the default prompts there Jamie when you add a new folder
*Reactions: 👍*

**Jamie Sabino** - 7:16:30 AM
Gareth Tucker looks like QA team has some automation triggering it appears, can someone point me to where this is running on your end? I don't see it on cron on DEV01, would like to turn it off if indeed its running to debug base cases

**Jamie Sabino** - 7:43:23 AM
also, Orlando Richards i think you fixed up the proxy issues on FTL, can we confirm this is setup properly on DEV01 ? Looks like that might be happening again.. have to debug further, but ideally we need to turn off the automation for a bit as well

**Orlando Richards** - 7:45:28 AM
Hmm - can you remind me what that was?

**Orlando Richards** - 7:45:53 AM
Also - how's the AI+ looking on the High Wycombe prod cluster for IBC - managed to get the old prompts back on and everything happy? Or still chasing issues?

**Gareth Tucker** - 7:49:04 AM
Unlikely to be automation Jamie, manual testing is in progress on that instance at the moment for other features. It should go quieter in a few hours time if you wanted to look at stuff in isolation.

*Attachments:*
- messageReference

**Jamie Sabino** - 8:33:53 AM
Orlando Richards Wycombe was left running, but the issue around the ai+ admin gui on one of the services is still being looked at but shouldn't be impacting to e2e workflow.
*Reactions: 👍*

**Jamie Sabino** - 8:35:05 AM
This is what i'm seeing, i have to figure out if these are proxy files being triggered as well (this was the issue that someone fixed in FTL, not sure if it's behind us now ).

*Attachments:*
- messageReference
- Screenshot 2025-09-03 at 11.34.03 AM.png

**Jamie Sabino** - 8:35:59 AM
but yes, hoping things settle down, i am trying to tune it up to see if we can get past the backlog as i'm seeing some weird errors in the space01/qa1 bucket files.. tbd

**Orlando Richards** - 8:37:20 AM
did you get the old prompts back in place okay?

*Attachments:*
- messageReference

**Gareth Tucker** - 8:44:02 AM
You shouldn't be getting events for proxies Jamie on this instance, those resources are configured to be ignored. It is likely to just be actual QA traffic from testing. It should start to go quieter in the next hour or so.

*Attachments:*
- messageReference
*Reactions: 👍*

**Jamie Sabino** - 9:08:50 AM
Yes, i'm pretty sure they were recovered and the same. I restored it from a backup.. but worth double checking.. I think Barry did them ??

*Attachments:*
- messageReference

**Orlando Richards** - 9:09:59 AM
are you able to check? It's been a long time since i've done the POSTing and PATCHing to that api, not sure where my notes are...

**Jamie Sabino** - 9:21:03 AM
All the 4 buckets are configured, and i see all the prompts there, which i backedup and restored, now, i don't remember what the text was before, but it's there. http://10.60.0.179:8080/configuration/transcribe-summarize is the location, and we shouldn't need to post directly, just use the Admin gui for any changes.

**Jamie Sabino** - 11:27:46 AM
Cardiff Lab Dev01 Update - Gareth Tucker et Everyone, 


 


1- Metadata and Transcription is functioning (see inline pics - currently unable to reproduce but i suspect it was the Ollama outage over the weekend TBD).  


 


2 - QA Bucket validation -  Need to rca what's causing the repeated jobs / workloads as seen in the rabbitmq pic above, i'm seeing evidence of the same file being requested over and over (for example the /app/media/space01/QA1/03-09-25/Voice0014.aac file noted below every 3 minutes ): I'm going to disable AI+  and let the queue grow to identify if its upstream or if it is our service (given the 3 minute cycle, should be easy to determine)


 



{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/space01/QA1/03-09-25/Voice0014.aac", "timestamp": "2025-09-03 17:55:55", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_2", "TaskId": "135627692653456", "CorrelationId": "30c3ae0e-cd47-4a47-814d-c6f53b0dd4ff", "JobId": "39618ba4-e88d-4367-8d4d-a0fc07b79627", "FunctionName": "process", "ProcessingTime": "53.672s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x7b5d96d2caf0>", "media_path": "/app/media/space01/QA1/03-09-25/Voice0014.aac", "ReturnValueStr": "answers={'summary': 'The video depicts a family\\'s daily life in a castle, with a young child asking various questions and engaging in playful interactions with his father. The scene is chaotic, with ... [truncated from 15817 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}

 


{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/space01/QA1/03-09-25/Voice0014.aac", "timestamp": "2025-09-03 17:58:42", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135641897113552", "CorrelationId": "f0c1d024-4c82-4ccc-a9a5-f368692e7d52", "JobId": "0f6b3328-2cec-4d36-9c9f-ffe16cf9dc0a", "FunctionName": "process", "ProcessingTime": "62.260s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x7b5cb211b610>", "media_path": "/app/media/space01/QA1/03-09-25/Voice0014.aac", "ReturnValueStr": "answers={'summary': \"The video appears to be a recording of a child, Bailey, interacting with their family members at home. The action taking place in this video involves a conversation between Bailey... [truncated from 15830 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}

 


{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/space01/QA1/03-09-25/Voice0014.aac", "timestamp": "2025-09-03 18:01:35", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135641532896608", "CorrelationId": "695f6652-7146-481f-88e1-c3d5c2d087d5", "JobId": "6fd07907-761a-47ea-9bfa-c9ca19b96384", "FunctionName": "process", "ProcessingTime": "58.434s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x7b5cb2528a30>", "media_path": "/app/media/space01/QA1/03-09-25/Voice0014.aac", "ReturnValueStr": "answers={'summary': \"The video features a northern man living with his family in a castle, engaging in everyday activities and conversations with his children. The scene shifts between scenes of mealt... [truncated from 15731 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}

 


{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/space01/QA1/03-09-25/Voice0014.aac", "timestamp": "2025-09-03 18:04:52", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135641532896608", "CorrelationId": "4a7ae31c-a66d-4bfa-a453-d087dbe19eb7", "JobId": "7fac8e69-aba3-4186-9cc8-74a5d18fbd21", "FunctionName": "process", "ProcessingTime": "64.600s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x7b5cb2104160>", "media_path": "/app/media/space01/QA1/03-09-25/Voice0014.aac", "ReturnValueStr": "answers={'summary': 'The video shows a family scene with a father and his young child interacting. The child asks about dinner, and there are repetitive conversations about food and eating. The family... [truncated from 16053 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}

 


{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/space01/QA1/03-09-25/Voice0014.aac", "timestamp": "2025-09-03 18:06:51", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_1", "TaskId": "135641532893696", "CorrelationId": "eff3aadd-e45c-45c0-8a12-9e1a5da2b8c1", "JobId": "88f70ab4-c7af-4cd7-be8e-cd73539dddef", "FunctionName": "process", "ProcessingTime": "67.618s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x7b5d702b6800>", "media_path": "/app/media/space01/QA1/03-09-25/Voice0014.aac", "ReturnValueStr": "answers={'summary': 'The video appears to be a domestic scene with a child, likely Bailey, and their father interacting in a castle setting. The child is speaking incoherently at times, using phrases ... [truncated from 15995 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}

*Attachments:*
- Screenshot 2025-09-03 at 2.16.02 PM.png
- Screenshot 2025-09-03 at 2.15.52 PM.png

**Jamie Sabino** - 11:59:11 AM
Seems to be isolated to the following folder , 


"bucket": "space01", "key": "QA1/03-09-25*"

*Attachments:*
- Screenshot 2025-09-03 at 2.57.13 PM.png
- Screenshot 2025-09-03 at 2.58.47 PM.png

**Jamie Sabino** - 12:15:44 PM
Gareth Tucker Jez Tucker found this thread , going to try and see if i can decipher this and find it in the dev01 server, but wonder if this is behind it

*Attachments:*
- messageReference

**Gareth Tucker** - 1:05:49 PM
that's space01 Jamie Sabino but yes, looks to be causing looping events

**Gareth Tucker** - 1:05:53 PM
will sort for you now

**Jamie Sabino** - 1:08:11 PM
Gareth Tucker its late, i think i'm good, we can finalize things your morning..

**Gareth Tucker** - 1:12:26 PM
it's ok, won't take long, still keen for you to get to the bottom of the problem with the qa space if you can please

**Gareth Tucker** - 1:13:21 PM
should be resolved now, Iris Notify is no longer producing errors for space01
*Reactions: 👍*

**Gareth Tucker** - 1:17:11 PM
looks like T&S is still working through the duplicate events at the moment
*Reactions: 👍*

**Jamie Sabino** - 1:52:04 PM
I’ll deal with that. GN should be simple now
*Reactions: 👍*

**Jason Perr** - 3:29:36 PM
Once again we need to get the Pixstore volume mounted on the AI server at Alt. Is there a document on this procedure? Where is the central repo for all of the documentation for IRIS? Do we have this?

**Jason Perr** - 3:57:08 PM
I fixed the mount and wrote some documentation for our team here: 


https://perifery.atlassian.net/wiki/spaces/AI/pages/4442554370/IRIS+-+Solution+Architecture


 


would love someone who knows more than me to please check this out and ensure I'm not suggesting anything incorrect Jez Tucker??

**Jamie Sabino** - 7:28:32 PM
Gareth Tucker QA bucket is working now.  I uploaded 6 test files, one of which i'm going to look further into, but the QA bucket issue is fixed. I raised a jira https://perifery.atlassian.net/browse/AI-1026 which i think we already raised this issue before, but i'll provide either an offical mop/update to the documentation on how to create a bucket and resave it (as that's the current workaround and i need to confirm and test).. or we will push a patch..  Arunita sahu(IC) Ankit Josh(IC) heads up, if there's anything QA team needs here to unblock.... cheers
*Reactions: 👍, 👍*


## 9/4/2025

**Gareth Tucker** - 1:01:28 AM
Thanks Jamie Sabino initial tests are looking a lot better now. We'll bear the workaround in mind until there is a fix available. It doesn't sound like too painful an issue to resolve hopefully and thanks for your help getting to the bottom of that for us.

**Ankit Josh(IC)** - 1:05:47 AM
Hi Jamie Sabino Gareth Tucker the Wycombe ConfigGUI issue (Configuration page was not loading for NotificationAPI) is fixed now.
*Reactions: 👍*

**Orlando Richards** - 1:39:56 AM
Guessing you don't have a root cause for why it wasn't mounted? 


 


Docs looks sensible at a first glance - good practical material for anyone not familiar with GPFS already!


 


Note that "PixStor" is spelt "PixStor", or "Pixstor" possibly nowadays - no e at the end.

*Attachments:*
- messageReference

**Orlando Richards** - 1:42:56 AM
Jason Perr Jamie Sabino - Root cause for the Alt lab per-ai node not mounting the file system is most likely that the gpfs service is not enabled:


 



 


root@per-ai:~# systemctl status gpfs
● gpfs.service - General Parallel File System
     Loaded: loaded (/lib/systemd/system/gpfs.service; disabled; vendor preset: enabled)
 


I've done:


 



 


systemctl enable gpfs
I suggest you do a reboot test to make sure it all comes back how you want.

*Attachments:*
- messageReference
*Reactions: 👍*

**Jason Perr** - 3:55:22 PM
Where can I access the installer / docs to be able to do updates of Vision/IRIS? we need to be able to do this in Alt ideally anytime in PST hours. Can someone please point me to this?


## 9/5/2025

**Orlando Richards** - 7:48:48 AM
Hi Jason,


Ideally we'd do this with a PixStor upgrade to a build with the new versions in it. Hub and Vision are both in pre-release state just now though, with a very targeted focus on the IBC demo environment and nothing more "generic".


 


What's your driver for getting a new version?

**Jason Perr** - 8:04:19 AM
I'd like to see transcripts functional. The goal for the alt system was to do demos but it just looks broken at the moment.

**Jason Perr** - 8:04:55 AM
Is the installation / upgrade really that complex that we don't think others can work with it / learn it based on current docs??

**Orlando Richards** - 8:05:15 AM
it's more that there are no builds yet

**Jason Perr** - 8:05:26 AM
Ah

**Orlando Richards** - 8:05:40 AM
But if there's a specific feature that you're after, we can ask!

**Jason Perr** - 8:06:36 AM
If there is a way I could get a build with the transcripts working that would be awesome. At the moment in the vision ui we see {object} instead of the actual transcript

**Orlando Richards** - 8:06:49 AM
Gareth Tucker - what's the shortest path to getting "transcripts functional" on the Alt lab? It'll likely be on vision 0.11.9

**Gareth Tucker** - 8:07:02 AM
Jason Perr please feel free to take a nose on PixStor Dev 01 in Cardiff if you like in the short term.

**Gareth Tucker** - 8:07:30 AM
Once we have High Wycombe ready for IBC, we can look at what we can do on Alt

**Jason Perr** - 8:10:11 AM
Sounds good.

**Jamie Sabino** - 8:16:50 AM
What is the plan for Wycombe Upgrade?  Please send out some bridge invites..thx

**Orlando Richards** - 8:20:26 AM
it's being worked on just now - no bridges, just developers getting stuff done

**Gareth Tucker** - 8:20:55 AM
took the words out of my mouth

**Jamie Sabino** - 8:22:50 AM
well, wanted to ensure the upgrade with smoothly with ai+ as well, hence i asked earlier this week, makes things alot easier when we have the right folks to tweak something (ie, mounting, loop bug in rabbit etc etc).  I suppose i just need a deadline when we expect this to be running and i'll work towards that. all good.

**Gareth Tucker** - 8:24:09 AM
You are already up-to-date on High Wycombe yeah Jamie?

**Gareth Tucker** - 8:24:32 AM
e.g. same as what is on Cardiff?

**Jamie Sabino** - 8:30:58 AM
yes Gareth Tucker, BUT we know things break

**Jamie Sabino** - 8:31:22 AM
focus on what you folks are doing, i'll check e2e after

**Gareth Tucker** - 8:34:55 AM
Indeed, we should be in a good place to fix them if they do and we will do an e2e. Need to finish the code first though

**Gareth Tucker** - 8:36:12 AM
Just trying to get ahead of the game at the moment on High Wycombe ahead of Monday so that we have more time to react if needed.
*Reactions: 👍*

**Gareth Tucker** - 12:23:07 PM
Some good progress made on the High Wycombe instance this evening.


 


Still some work to do on Monday, in particular, for pre-existing content.


 


New content however looks to be hanging together nicely so far. One very basic e2e below for a new file dropped via Vision, displaying it's transcription generated by AI+
*Reactions: 👍*

**Gareth Tucker** - 12:30:02 PM
Possibly one for the AI+ team. I cannot be sure at the moment as we cannot see the content of events easily on High Wycombe right now, but it looks like we may be getting duplicate transcription entries. Has this been seen at all in your own testing Jason Perr Justin Toribio Jamie Sabino?


 





 


It happens with the good old full length version of How Did The Sriracha Shortage Happen.mp4

**Jamie Sabino** - 12:43:42 PM
Gareth Tucker negative, haven't seen it, but let me have a look. have a great weekend.
*Reactions: 👍*

**Jamie Sabino** - 1:58:29 PM
Everyone, was there new creds for admin access on the new Wycombe install?  Using the creds here: https://arcapix.atlassian.net/wiki/spaces/Labs/pages/5060362264/HW+Prod+Cluster+-+Iris , i've lost access it appears, i'm unable to upload a file .  I checked all the folders, same issue , no file upload option, appears read only.

*Attachments:*
- Screenshot 2025-09-05 at 4.56.00 PM.png

**Gareth Tucker** - 2:01:55 PM
Default access is read only now Jamie, which user are you logging in as?

**Jamie Sabino** - 2:03:45 PM
pixadmin,

**Jamie Sabino** - 2:04:10 PM
that said, looking at the logs it appears the same file triggered the workflow (2 separate occasions 1.5 hours apart)

**Jamie Sabino** - 2:04:51 PM
{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/space01/Gareth/Sriracha_30_2025090501.mp4", "timestamp": "2025-09-05 17:45:41", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "140214039990816", "CorrelationId": "b04a8856-2937-4745-8b5d-bf46ea084d74", "JobId": "b03bf2a2-2a2a-42e9-8aef-17406a3b7c8a", "FunctionName": "process", "ProcessingTime": "35.312s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x7f861f30c970>", "media_path": "/app/media/space01/Gareth/Sriracha_30_2025090501.mp4", "ReturnValueStr": "answers={'summary': \"The Sriracha hot sauce company used a ranch owned by Craig Underwood as its primary source for peppers for 28 years. Underwood's farm supplied jalapenos that helped grow the compa... [truncated from 805 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}
{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/space01/Gareth/How Did The Sriracha Shortage Happen_2025090501.mp4", "timestamp": "2025-09-05 19:09:10", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "140214044768544", "CorrelationId": "d70caf04-0cd5-44a5-8a0e-d5ff71576bc9", "JobId": "910326d1-3af7-4cd4-b3d7-cc90a97ad56d", "FunctionName": "process", "ProcessingTime": "241.206s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x7f861f4b61a0>", "media_path": "/app/media/space01/Gareth/How Did The Sriracha Shortage Happen_2025090501.mp4", "ReturnValueStr": "answers={'summary': \"The documentary explores the Sriracha shortage caused by a complex web of supply-related issues between Huey Fung Foods and Underwood Ranches. The relationship began in 1988 but e... [truncated from 18039 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}

**Jamie Sabino** - 2:06:39 PM
I don't believe this has been tested Gareth Tucker, would we allow the same file with the same file name be pushed to the same space to trigger the AI+ workflow?  could be behind it.. i / we always used different names.. unless there was a delete , and a new file (with the same name added) but clean up never happened?? some asynchronous process?

**Gareth Tucker** - 2:08:53 PM
All file names used for testing earlier were unique

**Gareth Tucker** - 2:09:10 PM
pixadmin should have write access now to space01

**Jamie Sabino** - 2:09:47 PM
we got 2 rabbit messages for the same file 



(base) root@hw-ngbox-gpu-02:~# docker logs -f notification-api-aiplus-notification-api-1 2>&1 | grep "90501"

{"filename": "httpClientManager.py", "func_name": "_prepare_http_request_logging", "lineno": 517, "event": "HTTP Outbound Request", "timestamp": "2025-09-05 17:45:05", "ComponentName": "NotificationAPI", "ThreadName": "MainThread", "TaskId": "139915247484208", "CorrelationId": "db25b66f-e7bb-4e8a-acb2-2fdb92f503eb", "HttpMethod": "POST", "URL": "http://0.0.0.0:9003/process", "HttpRequestBody": {"job_id": "b03bf2a2-2a2a-42e9-8aef-17406a3b7c8a", "media_file": "space01/Gareth/Sriracha_30_2025090501.mp4", "processing_type": "Queue", "callback_url": "rabbitmq://", "config": {"transcription": {"prompts": []}, "vision": {"clip_enhancement": {}}, "processing": {}, "preprocessing": {}, "augmentation": {"brightness": {}, "contrast": {}, "rotation": {}, "horizontal_flip": {}}, "model": "llama3.1:8b", "transcriber": "whisper", "prompts": [{"fieldName": "summary", "prompt": "Generate a summary not to exceed 500 characters which describes in detail the action taking place in this video. When describing the content, refer to the transcript provided as the video instead of saying the transcript", "type": "string"}, {"fieldName": "keywords", "type": "json", "prompt": "Generate a list a of 10 keywords which would be most applicable for referencing this content"}]}, "queue_metadata": {"fsInode": {"fsid": "6418838248910513162", "ino": "1575977", "igen": "1656858334"}, "s3object": {"endpointUrl": "https://10.100.0.1:7070", "bucket": "space01", "key": "Gareth/Sriracha_30_2025090501.mp4", "etag": ":6418838248910513162:1575977:1656858334"}}, "tenant_id": "iris"}, "log_level": "INFO", "log_channel": "aiplus.core.http.httpClientManager"}

{"filename": "httpClientManager.py", "func_name": "_prepare_http_request_logging", "lineno": 517, "event": "HTTP Outbound Request", "timestamp": "2025-09-05 19:05:08", "ComponentName": "NotificationAPI", "ThreadName": "MainThread", "TaskId": "139915247483792", "CorrelationId": "42083288-ddfa-4ee3-895f-b79e4b2ea2f7", "HttpMethod": "POST", "URL": "http://0.0.0.0:9003/process", "HttpRequestBody": {"job_id": "910326d1-3af7-4cd4-b3d7-cc90a97ad56d", "media_file": "space01/Gareth/How Did The Sriracha Shortage Happen_2025090501.mp4", "processing_type": "Queue", "callback_url": "rabbitmq://", "config": {"transcription": {"prompts": []}, "vision": {"clip_enhancement": {}}, "processing": {}, "preprocessing": {}, "augmentation": {"brightness": {}, "contrast": {}, "rotation": {}, "horizontal_flip": {}}, "model": "llama3.1:8b", "transcriber": "whisper", "prompts": [{"fieldName": "summary", "prompt": "Generate a summary not to exceed 500 characters which describes in detail the action taking place in this video. When describing the content, refer to the transcript provided as the video instead of saying the transcript", "type": "string"}, {"fieldName": "keywords", "type": "json", "prompt": "Generate a list a of 10 keywords which would be most applicable for referencing this content"}]}, "queue_metadata": {"fsInode": {"fsid": "6418838248910513162", "ino": "1575960", "igen": "1703706743"}, "s3object": {"endpointUrl": "https://10.100.0.1:7070", "bucket": "space01", "key": "Gareth/How Did The Sriracha Shortage Happen_2025090501.mp4", "etag": ":6418838248910513162:1575960:1703706743"}}, "tenant_id": "iris"}, "log_level": "INFO", "log_channel": "aiplus.core.http.httpClientManager"}

**Gareth Tucker** - 2:10:55 PM
try dropping your own file fresh now and see what happens
*Reactions: 👍*

**Jamie Sabino** - 2:11:01 PM
Fair, from our perspective looks like 2 requests.. could be behind the duplicate json.  I can test this , just not sure how this happened via the ui

*Attachments:*
- messageReference

**Jamie Sabino** - 2:11:18 PM
cheers.. thanks for unblocking me.. i'm interested now lol
*Reactions: 👍*

**Gareth Tucker** - 2:13:59 PM
2 different files btw Jamie, your grep is catching them both


 






 


Gareth/Sriracha_30_2025090501.mp4
Gareth/How Did The Sriracha Shortage Happen_2025090501.mp4

**Jamie Sabino** - 2:25:00 PM
gotcha, was able to reproduce the issue,

**Jamie Sabino** - 2:25:39 PM
this is something in our space, we'll look at it. i'll follow up,

**Gareth Tucker** - 2:37:59 PM
Cheers Jamie
*Reactions: 👍*

**Jamie Sabino** - 3:26:58 PM
the issue is only reproducible in Wycombe at the moment, and I'm seeing different behavior (which we'll need to figure out why).  just an fyi..
*Reactions: 👍*

**Gareth Tucker** - 3:41:06 PM
I think we've seen it in Cardiff too but I haven't had time to take a closer look yet, similar was spotted by Rich with the same file and he has another example too I believe. Will share next week if repeatable on the other file.
*Reactions: 👍*

**Jamie Sabino** - 3:42:12 PM
Please do.

**Justin Toribio** - 9:05:34 PM
Gareth Tucker Jamie Sabino is it that ONE specific video that creates this issue? Gareth/How Did The Sriracha Shortage Happen_2025090501.mp4 because if so, my guess is that it's corrupted in some way.  If you watch that part of the video...


 





 


She actually says: "... they absolutely could have crop failure when their neighbours are doing great."


 


But in that screenshot it's: "... they absolutely could have crop failure when they're growing."


 


And then it suggests a repeating loop in the 12:19-12:20 timestamp, but when you watch the vid, that's not what's being said at all at that time.  This suggests a corrupted "broken record" type situation to me during processing of that particular part of the video.

*Attachments:*
- messageReference

**Jamie Sabino** - 9:07:09 PM
Justin Toribio same file ran clean on cardif (5 runs in Wycombe about 3 little different behaviour )

**Jamie Sabino** - 9:08:58 PM
That said.. I can checksum the file to confirm . I’ll check the download I took of it as that’s what I pushed to Cardiff

**Justin Toribio** - 9:09:20 PM
Like that exact same file, as in you transferred that exact one to Cardiff?  Or copies of the same Sriracha vid that we keep using?

**Jamie Sabino** - 9:11:00 PM
Same copy. The one I sent you. Interesting, it does NOT have that repeat at that time

**Justin Toribio** - 9:14:18 PM
Either way, whatever vid is creating that issue, I suggest watching the playback of that exact vid around that timestamp and see if there's any issues.

**Justin Toribio** - 9:29:10 PM
Been discussing this with Jamie, and the fact that the same vid only produces the error at HW but not at Cardiff definitely suggests some issue / difference with the HW env, i.e. driver, gpu etc... something corrupting the processing.


## 9/8/2025

**Unknown User** - 6:00:41 AM


**Unknown User** - 6:00:49 AM


**Jamie Sabino** - 6:51:09 AM
http://10.60.0.179:8080/servers

**Unknown User** - 6:55:42 AM


**Unknown User** - 6:55:43 AM


**Unknown User** - 6:57:52 AM


**Jamie Sabino** - 8:54:12 AM
Gareth Tucker i'm not seeing any metadata/transcription showing anymore on any asset in Wycombe.. is it just me??

**Gareth Tucker** - 9:00:42 AM
we have re-indexed to resolve another issue Jamie
*Reactions: 👍*

**Gareth Tucker** - 9:01:13 AM
there will be a bit of a backlog whilst it works it's way through all the events for re-processing

**Jamie Sabino** - 11:23:47 AM
Gareth Tucker et al Everyone, we will be rebooting AI+ node on Wycombe, this will cause a loss of jobs in the queue (post re-indexing as noted above)..

**Barry Evans** - 11:42:22 AM
Thanks Jamie can you let me know when you’re all wrapped up?

**Jamie Sabino** - 12:25:25 PM
Barry Evans will do, pulling in a little "tiger" team to figure out how we are going to proceed here on the "looping" issue..

**Barry Evans** - 1:31:31 PM


**Jamie Sabino** - 6:51:14 PM
Barry Evans , we are fairly confident the issue is related to the specific GPU in Wycomb. We have confirmed the new Triton version of AI+ does not exhibit this behavior and aligns where we believe the issue is. That said , Jason is going to synch with you on expectations/ script  for the demo and we will confirm that is all good. The video is question has specific characteristics that trigger this as well, so we can likely scrub the content we want to show and tell.


## 9/9/2025

**Barry Evans** - 1:03:17 AM
anybody getting a 404 in wycombe?

**Gareth Tucker** - 1:12:59 AM
Check your URL Barry

**Gareth Tucker** - 1:13:09 AM
sometimes a stray * can cause that at the end

**Gareth Tucker** - 1:13:13 AM
https://hw-prod-mn-01.lab.int.arcapix.com:9505/object-listing/space01

**Gareth Tucker** - 1:13:26 AM
is displaying for me, logged in as pixadmin

**Barry Evans** - 1:48:43 AM


**Gareth Tucker** - 3:53:18 AM
Jamie Sabino as touched on, this does also happen in Cardiff, although it does appear to manifest itself in a slightly different way


 





 


As shown in the right hand box on the above screenshot, we have many transcription entries with the same timestamp, but unlike High Wycombe, they don't appear to be repeated text.


 


However, the 2 transcriptions shown here are for the same file in Vision, opened in 2 browser windows. As the left hand box shows, similar text has already been said earlier in the video.


 


This is the other example that we have in Cardiff


 





 


which looks to have many occurrences throughout the transcription of the same issue and some other interesting observations


 














 


Both files are in the following folder if you would like to take a closer look.


 


https://ca-sn-dev-01.om.cardifflab:9505/object-listing/qa/AI%2FTranscription%20Duplicates%2F

*Attachments:*
- messageReference

**Barry Evans** - 3:55:56 AM
so everyone is aware - not worried about this for IBC. We can even tie in a tagging use case into this from the interface, we'll make lemonade
*Reactions: 👍*

**Jamie Sabino** - 5:45:52 AM
Thanks Gareth TuckerI did see some of these and checked some of the files for characteristics. We will be factoring in some observations seen here (hardware delta, file types (audio only, video only, video only with sound no worlds etc etc).

*Attachments:*
- messageReference
*Reactions: 👍*

**Jamie Sabino** - 5:46:52 AM
Would like to get our environments updated , FTl and ALt now that Wycombe is complete

**Gareth Tucker** - 6:37:15 AM
For sure. The High Wycombe upgrade highlighted some gaps in our migration notes and a full re-index is required to accommodate a change in the way that the proxies are now stored and to overcome any issues that legacy indexed transcriptions can cause.


 


In short, bit of a team effort required, very manual, not fully documented yet and work is still in progress on getting High Wycombe ready for the show + additional changes required for the GA.


 


We'll need to work out how best to feather in the upgrades for the US instances as soon as time allows.

**Jamie Sabino** - 6:54:35 AM
Gareth Tucker is there a Jira / Spike for that re-index issue? Need to consider the impact on AI+ here, this isn't ideal to reprocess ai+ workflows on assets for an upgrade.  I can create a jira in our space to atleast review what the implementation will be on your end and ensure there isn't any changes needed .

*Attachments:*
- messageReference

**Jamie Sabino** - 7:08:08 AM
https://perifery.atlassian.net/browse/AI-1040 for the transcription issues, targeted for R2

**Gareth Tucker** - 7:10:16 AM
it's a side effect of the iterative dev process we went through to implement transcriptions which can lead to a conflict in Elastic for any instance that received transcriptions before Vision implemented the handling for them.


 


The re-index can be worked around if direct access to Elastic is available on an instance. Nothing is documented on the process currently and we are not planning to at the moment as this won't affect fresh installs, this is just dev migration issue.

*Attachments:*
- messageReference


## 9/10/2025

**Daniel Iwan** - 8:33:08 AM
Hi Jez Tucker we are currently experiencing error as below on dev-02 when creating new user


Any idea how to fix it?

*Attachments:*
- Screenshot 2025-09-10 at 16.31.37.png

**Polly Miller** - 8:39:59 AM
Also, dev-02 has this error in the keycloak logs:


2025-09-10 15:31:30,396 ERROR [org.keycloak.services] (executor-thread-221) KC-SERVICES0025: Error when validating client assertion: java.lang.RuntimeException: Error when loading public keys: javax.net.ssl.SSLHandshakeException: PKIX path building failed: sun.security.provider.certpath.SunCertPathBuilderException: unable to find valid certification path to requested target


Anyone know which certificates it needs

**Jez Tucker** - 8:54:40 AM
We'll need a  Ibenegbu Chukwunonso  for that.  let me see what we can do.
*Reactions: 👍*

**Jez Tucker** - 9:08:26 AM
Hey Daniel Iwan looks like the java store is missing it's ssl cert / was not setup in the deployment.  We can do this solo, but you might like to tag along for wider knowledge?

**Daniel Iwan** - 9:08:31 AM
that's probably just cert issue but I have no idea why would that change

**Jez Tucker** - 9:36:06 AM
(resolved).  we could see that the cert was updated on Sep 1st.  Not sure of why/how (not in the history), but Sep 1st is a Monday, so may be manual integration process related.  Something to keep an eye on.

**Daniel Iwan** - 9:36:59 AM
Polly Miller please check if it works for you as well now

*Attachments:*
- messageReference


## 9/11/2025

**Polly Miller** - 1:11:33 AM
Daniel Iwan I can confirm that I am able to create users against now

**Polly Miller** - 2:35:53 AM
Ngenea hub on dev-02 is unable to create users again now, same error as before 



 


User can not be created.
Detail: Failed to synchronise user with authentication service
 


This time there's no errors in keycloak so that may have been a red herring. Is anyone able to take a look at the ngenea logs and see what's going on?

**Gareth Tucker** - 8:35:39 AM
Justin Toribio details on the new FileUpdated and FileMetadataUpdated events are available on here


 


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4297883665/Pixstor+filesystem+integration+usin…


 


Any questions, please give us a shout. Thanks.
*Reactions: 👍*


## 9/15/2025

**Gareth Tucker** - 4:23:53 AM
FYI, today's integration meeting has been shifted to tomorrow at the same time as requested by Jez and the team. Thanks.
*Reactions: 👍, 👍, 👍, 👍*

**Unknown User** - 6:05:14 AM


**Unknown User** - 6:05:18 AM



## 9/16/2025

**Gareth Tucker** - 5:59:14 AM
Everyone Today's meeting is postponed by 30 mins

**Gareth Tucker** - 5:59:34 AM
Pixit team are looking into some issues on Cardiff-02 following an upgrade earlier today

**Gareth Tucker** - 6:24:22 AM
Everyone the call is postponed by another 30 mins as Cardiff-02 is still being worked on. We will keep you posted.

**Unknown User** - 6:36:07 AM


**Unknown User** - 6:36:19 AM


**Unknown User** - 6:36:20 AM


**Unknown User** - 6:36:26 AM


**Orlando Richards** - 6:36:27 AM
3pm now, yeah?

**Unknown User** - 6:36:45 AM


**Gareth Tucker** - 6:37:21 AM
Yes
*Reactions: 👍*

**Unknown User** - 7:00:47 AM


**Unknown User** - 7:00:55 AM


**Jez Tucker** - 7:05:22 AM
ok... I think we are good, probably, maybe

**Jez Tucker** - 7:05:27 AM
we'll jump on this call
*Reactions: 👍*

**Jez Tucker** - 7:43:04 AM
teams crashed

**Jez Tucker** - 7:43:14 AM
feels like OOB coordination for bringing the stack together

**Unknown User** - 7:45:20 AM


**Unknown User** - 7:45:23 AM


**Unknown User** - 7:53:58 AM


**Jamie Sabino** - 12:47:28 PM
Gareth Tucker and Orlando Richards, we are coming up to the end of our sprint and wanted to know when your guys next release is targeted,  i'm assuming we are still sticking with the 20th, and targeting Wycombe for initial integration, (i think Gareth you were going to find out if there is any booked demo's etc, as this might take some time to bring up)


## 9/17/2025

**Gareth Tucker** - 1:12:06 AM
Hi Jamie Sabino both teams this side of the pond are aiming to get code complete by the end of the week which means the next install update could be the 19th, but more likely 22nd.


 


High Wycombe is still the target for acceptance testing. There are 2 training sessions planned for today and tomorrow which I suspect will be hosted from there and then hopefully it will be available for upgrade. We will confirm following the sessions.
*Reactions: 👍*

**Daniel Iwan** - 1:47:59 AM
hi all, post upgrade of our dev-02 we are seeing some panics on versitygw as below


I think service stopped its auto-restart at some point. Manual stop/start resolved this but it may be worth taking a look Jez Tucker


 



 


Sep 16 16:41:19 ca-sn-dev-02 versitygw-iris[26454]: 16:41:19 | 200 |    1.960721ms | 10.222.222.2 | GET | /space01/.resources/fb/0f/_3300357220954201602_274944_1721195317/thumb.jpeg | - | response-content-disp>
Sep 16 16:41:21 ca-sn-dev-02 versitygw-iris[26454]: 16:41:21 | 200 |   15.339042ms | 10.222.222.2 | GET | /space01 | - | list-type=2&delimiter=%2F&max-keys=50&prefix=Bogdan%2F
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: 16:41:21 | 200 |   12.831249ms | 10.222.222.2 | GET | /space01/.resources/5f/ce/_3300357220954201602_271398_1472490764/thumb.jpeg | - | response-content-disp>
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: panic: runtime error: invalid memory address or nil pointer dereference
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: [signal SIGSEGV: segmentation violation code=0x1 addr=0x0 pc=0x1912de8]
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: goroutine 263 [running]:
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/versity/versitygw/backend/ngenea.(*Ngenea).GetObject(0xc00024c280, {0x2009098, 0xc00068e008}, 0xc0004df440)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/backend/ngenea/ngenea.go:343 +0x8a8
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/versity/versitygw/s3api/controllers.S3ApiController.GetActions({{0x201b420, 0xc00024c280}, {0x200e820, 0xc000040140}, {0x0, 0x0}, {0x0, 0x0}, 0x0,>
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/controllers/base.go:513 +0x3510
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*App).next(0xc0004d8a08, 0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:143 +0x1be
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*Ctx).Next(0x1c46da0?)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1028 +0x4d
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/versity/versitygw/s3api.New.AclParser.func8(0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/acl-parser.go:84 +0x7d8
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc000434608?)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/versity/versitygw/s3api.New.VerifyMD5Body.func7(0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/md5.go:32 +0x2bb
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*Ctx).Next(0x8?)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/versity/versitygw/s3api.New.VerifyV4Signature.func6(0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/authentication.go:52 +0x123d
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc0003ea6a0?)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/versity/versitygw/s3api.New.VerifyPresignedV4Signature.func5(0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/presign-auth.go:90 +0x7ce
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc000434608?)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1025 +0x3d
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/versity/versitygw/s3api.New.DecodeURL.func2(0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/rpmbuild/rpmbuild/BUILD/versitygw-1.0.14/s3api/middlewares/url-decoder.go:34 +0x173
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*App).next(0xc0004d8a08, 0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:143 +0x1be
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*Ctx).Next(0xc00049d800?)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/ctx.go:1028 +0x4d
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2/middleware/logger.New.func3(0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/middleware/logger/logger.go:119 +0x2ed
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*App).next(0xc0004d8a08, 0xc000434608)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:143 +0x1be
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/gofiber/fiber/v2.(*App).handler(0xc0004d8a08, 0xb476ef?)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/gofiber/fiber/v2@v2.52.8/router.go:170 +0x69
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/valyala/fasthttp.(*Server).serveConn(0xc000268248, {0x20101b8, 0xc00024e708})
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/server.go:2455 +0x11b1
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/valyala/fasthttp.(*workerPool).workerFunc(0xc00039bdd0, 0xc00070e180)
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:225 +0x92
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: github.com/valyala/fasthttp.(*workerPool).getCh.func1()
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:197 +0x32
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]: created by github.com/valyala/fasthttp.(*workerPool).getCh in goroutine 24
Sep 16 16:41:22 ca-sn-dev-02 versitygw-iris[26454]:         /root/go/pkg/mod/github.com/valyala/fasthttp@v1.62.0/workerpool.go:196 +0x194
Sep 16 16:41:22 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Main process exited, code=exited, status=2/INVALIDARGUMENT
Sep 16 16:41:22 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Failed with result 'exit-code'.
Sep 16 16:41:22 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Service RestartSec=100ms expired, scheduling restart.
Sep 16 16:41:22 ca-sn-dev-02 systemd[1]: versitygw@iris.service: Scheduled restart job, restart counter is at 1.
Sep 16 16:41:22 ca-sn-dev-02 systemd[1]: Stopped Ngenea enabled Versity Gateway S3 service.
Sep 16 16:41:22 ca-sn-dev-02 systemd[1]: Started Ngenea enabled Versity Gateway S3 service.

**Jez Tucker** - 2:00:33 AM
let me check that for you

**Jez Tucker** - 2:03:15 AM
looks like pixstor alpha.7 has an older -10 versity rpm without the fix in, I will bump it to -11


we'll get that rolled into alpha.8

**Jez Tucker** - 2:04:51 AM
you are good to go
*Reactions: 👍, 👍*


## 9/18/2025

**Gareth Tucker** - 12:50:05 AM
Morning Jez Tucker and the Hub team. We started to see some unexpected behaviour last night when logging in to Hub on PixStor Dev 02 in Cardiff which seems to have partially solved itself overnight. Both Rich and I were affected separately whilst completing our own testing.


 


When using "Login with Iris" with pixadmin/edison2, we were getting "Request failed with status code 400" following login via Keycloak. I cannot reproduce this issue at the moment.


 


When using "Hub only" with pixadmin/edison2, we were getting "Error occurred during authentication. Status code: 500". This is still happening for me now.


 


Separate side note too, when you can "Login with Iris", if you try to logout you get "Invalid redirect uri" in Keycloak. Guessing that one is just a config issue.


 


Any questions, please give us a shout.

*Attachments:*
- Screenshot 2025-09-17 185040.png
- Screenshot 2025-09-17 185148.png
- Screenshot 2025-09-18 083318.png

**Gareth Tucker** - 1:00:20 AM
I was also having some problems with "Open in Hub" from Vision when not logged in to Hub. This still seems to be the case, I get shown the Hub login until I manually "Login with Iris".

**Jez Tucker** - 4:46:29 AM
Gareth Tucker


"Login with Iris" with pixadmin/edison2, we were getting "Request failed with status code 400" 

Cannot reproduce.  Got an approx timestamps?


 


Regarding local hub user login.

This has been an iumpact through the upgrade process.

Solution was to delete the pixadmin user in keycloak.

Log into hub as pixadmin and keycloak pixadmin is recreated.


 


the logout issue is related to a setup issue, which we hope we have resolved, but need to restart hub to do so.


Can grab a bite and restart at 13.45
*Reactions: 👍*

**Gareth Tucker** - 4:53:20 AM
Sure, will get you some timestamps too

**Gareth Tucker** - 4:55:33 AM
My screenshot has this timestamp: 2025-09-17 18:50:40 UK time

**Gareth Tucker** - 4:56:33 AM
Any other timestamps would be less accurate but we can attempt to guess some if needed

**Orlando Richards** - 5:02:03 AM
you may need to clear the "is in keycloak" flag on the user in the hub database too, if it's already done it once

**Jez Tucker** - 5:56:18 AM
Gareth Tucker and team. we would like to twiddle the -02 node for a wee while to resolve the issues above.


Are we ok to proceed?

**Gareth Tucker** - 5:57:29 AM
Sure, we'll work around it if we lose access in any way

**Jez Tucker** - 5:58:20 AM
ok. starting now
*Reactions: 👍*

**Jez Tucker** - 6:24:46 AM
we see you are now running keycloak v26 on the cardiff-02 node.  when was that change made?

**Daniel Iwan** - 6:25:48 AM
that was last week Fri

**Daniel Iwan** - 6:26:03 AM
is that causing problems?

**Jez Tucker** - 6:28:55 AM
we are trying to square the circle to work to why SSO is now not working

**Jez Tucker** - 6:30:06 AM
hub's keycloak support between v21 and v26 is a very in flux atm 


but we will look further and see if we can configure it all as it should be


can vision support relative urls in keycloak ?

**Gareth Tucker** - 6:38:45 AM
Should do Jez as Dan was recommending similar for Hub
*Reactions: 👍*

**Daniel Iwan** - 6:56:13 AM
we have not tested this however and we are still using full redirect URL

**Jez Tucker** - 7:00:29 AM
yes we have kept your v26 keycloak as full url

**Jez Tucker** - 7:02:02 AM
I suspect we are going to end up at SSO is broken atm


until we get a version of pixstor with your v26 in which we can run against latest hub code - and there's less sliding doors of pixstor/hub/vision between v21 and v26


we are going to put it back to a situation whereby the main login issues etc and users are resolved, but this mean SSO and open in hub will be broken presently (unless you are already logged into hub non SSO)

**Jez Tucker** - 7:08:07 AM
Hub is returned, but I think we need some rapid keycloak work this week!

**Gareth Tucker** - 7:12:05 AM
Thanks Jez, we can work around the rest for now with any other testing that is going on on 02

**Orlando Richards** - 7:39:09 AM
FWIW - Daniel and I are on the cusp of having everything working on my dev systems, with hub + vision + pixstor keycloak


## 9/19/2025

**Orlando Richards** - 12:29:01 AM
Hi all - I'm failing at onedrive/sharepoint - can someone link me to the progress tracking spreadsheet?

**Gareth Tucker** - 12:47:42 AM
Here we go Orlando

**Gareth Tucker** - 12:47:46 AM
IRIS R1 and R2 tracking.xlsx

*Attachments:*
- IRIS R1 and R2 tracking.xlsx

**Orlando Richards** - 12:56:35 AM
thanks

**Orlando Richards** - 12:57:23 AM
lol - i was looking right at that one, thinking it was the wrong one - but there's a scroll left hidden behind column A!
*Reactions: 👍*

**Orlando Richards** - 12:57:29 AM


**Gareth Tucker** - 2:00:13 AM
Jez Tucker can you take a little look at Cardiff-02 for us when you have a mo please. We don't seem to be getting any events at the mo for space01. The schedule is configured and enabled but I don't see any jobs running for that Space.

**Jez Tucker** - 4:38:41 AM
Allo. We've looked at this and believe you are now receiving messages for space01 (for example)

**Gareth Tucker** - 5:04:54 AM
thanks Jez, will have a play shortly

**Gareth Tucker** - 5:05:37 AM
debug queue's are showing activity again so it looks promising

**Gareth Tucker** - 5:33:57 AM
FYI, the next integration meeting has been moved to Wednesday 24th to give the Hub team some time to iron out some pieces that they are working on.

**Gareth Tucker** - 5:45:10 AM
Jez Tucker events seem back in order on Cardiff-02 for space01, thank you

**Gareth Tucker** - 9:18:16 AM
Justin Toribio re: transcription segments for MetaGen v2, we may be able to sort something that works for both old and new without too much pain. Could you please share the proposed updated payload and we'll take a look at the beginning of next week and keep you posted.
*Reactions: 👍*

**Justin Toribio** - 9:21:25 AM
Awesome, sounds good.  Should look like this...


 






 


{
  "eventTime": "2025-09-07T17:56:54.779215Z",
  "eventName": "MetadataGenerated",
  "appId": "ai-plus/summarize",
  "dataVersion": "1.0.0",
  "data": {
    "summary": "There is no audio file being described in this context. However, I can provide a summary based on the transcription content.\n\nThe speaker says \"Test, this is a test audio file\" twice. It appears to be a simple recording of someone testing or verifying an audio system.",
    "keywords": "test, audio file",
    "transcription": {
      "segments": [
        {
          "text": "Test, this is a test audio file. Test, this is a test audio file.",
          "start": 1.28,
          "end": 6.32,
          "words": [
            {
              "start": 1.28,
              "end": 1.76,
              "text": "Test,"
            },
            {
              "start": 2.0,
              "end": 2.16,
              "text": "this"
            },
            {
              "start": 2.16,
              "end": 2.32,
              "text": "is"
            },
            {
              "start": 2.32,
              "end": 2.48,
              "text": "a"
            },
            {
              "start": 2.48,
              "end": 2.8,
              "text": "test"
            },
            {
              "start": 2.8,
              "end": 3.28,
              "text": "audio"
            },
            {
              "start": 3.28,
              "end": 3.6,
              "text": "file."
            },
            {
              "start": 3.84,
              "end": 4.24,
              "text": "Test,"
            },
            {
              "start": 4.48,
              "end": 4.72,
              "text": "this"
            },
            {
              "start": 4.72,
              "end": 4.88,
              "text": "is"
            },
            {
              "start": 4.88,
              "end": 5.04,
              "text": "a"
            },
            {
              "start": 5.04,
              "end": 5.44,
              "text": "test"
            },
            {
              "start": 5.44,
              "end": 5.92,
              "text": "audio"
            },
            {
              "start": 5.92,
              "end": 6.32,
              "text": "file."
            }
          ]
        }
      ],
      "language": "en",
      "error": null
    }
  },
  "tenantId": "iris",
  "source": {
    "fsInode": {
      "fsid": "3055232101365055754",
      "ino": "269503",
      "igen": "708092213"
    },
    "s3object": {
      "endpointUrl": "https://ftl-dev-sn-01:7070",
      "bucket": "space01",
      "key": "test_audio_5.m4a",
      "etag": ":3055232101365055754:269503:708092213"
    }
  }
}

*Attachments:*
- messageReference
*Reactions: 👍*

**Gareth Tucker** - 9:21:46 AM
Thanks
*Reactions: 👍*

**Gareth Tucker** - 9:23:53 AM
Looks like the old example we had had "score" for each word as well, I don't think we use it at the mo. Is that also a change though?

**Justin Toribio** - 9:24:45 AM
Yes, sorry, "score" is gone as well
*Reactions: 👍, 👍*

**Gareth Tucker** - 9:30:58 AM
Cool, it should be being ignored by us at the moment anyway, but we will double check
*Reactions: 👍*


## 9/22/2025

**Gareth Tucker** - 6:50:37 AM
Justin Toribio FYI, both the documentation and Vision components have been updated to support transcription "segments". The old way is also supported to accommodate AI+ instances that have not yet been upgraded.


 


Cardiff Dev 02 is running the latest Vision components that support this. Others to follow suit as and when they get upgraded, High Wycombe can follow next once the AI+ instance has been upgraded there.


 


The documentation has also been updated too


 


https://perifery.atlassian.net/wiki/spaces/MCS/pages/4275503112/Vision+Metadata+Integration+using+R…
*Reactions: 👍*

**Justin Toribio** - 9:45:20 AM
Gareth Tucker Great! Thanks for the update.  Jamie Sabino Jason Perr  FYI regarding the environments.
*Reactions: 👍, 👍*

**Jamie Sabino** - 9:59:08 AM
Gareth Tucker so sounds like we changing the plan? Was going to go right from our dev instance into Wycombe as discussed, but no problem reverting back to the original plan

*Attachments:*
- messageReference

**Gareth Tucker** - 10:15:51 AM
No change Jamie Sabino, you can carry on as you are going straight to High Wycombe. I just wanted to let you guys know that the change was made for segments and that Cardiff is ready for when it gets it's upgrade.


## 9/23/2025

**Gareth Tucker** - 9:41:30 AM
FYI, Keycloak SSO investigations are still going on so we have postponed this week's integration meeting to Friday at the usual time.


 


If we have earlier success, we may bring this forward. Will keep you posted.

**Jamie Sabino** - 1:55:23 PM
Gareth Tucker, looking like tomorrow mid day i'll start the Cardiff and Wycombe upgrades for ai+ (Iva Kalova fyi)


## 9/24/2025

**Gareth Tucker** - 1:11:51 AM
OK, thanks Jamie Sabino will run some double checks and give you the all clear before your day starts

**Gareth Tucker** - 2:55:13 AM
Jamie Sabino we have a demo running today until 3pm UK time from High Wycombe, after that all should be good for the upgrade there. We will let you know once the demo is complete.


 


re: Cardiff, you have the green light to start that whenever suits.
*Reactions: 👍*

**Jez Tucker** - 3:56:57 AM
Bogdan Stanciu  Allo. Nonso tells me you want a node with the issue on.  I will build you one.  But first I need to know if you are wanting it with Vision's own keycloak or the pixstor centralised keycloak - am presuming all v26?   Though also the cardiff-02 node has this issue.  What is it you specifically are looking for?

**Bogdan Stanciu** - 4:36:48 AM
Hi Jez, please ignore this for now, I'll need to dig a bit deeper to see if I'm missing something. At the moment, I can reproduce the issue on dev-02, so no point in building a new node. What I was really interested in checking is whether the hub version that Nonso is currently testing performs an overwrite of the auth cookie path -- but doesn't look like it

**Jez Tucker** - 4:51:33 AM
ok. Not a problem.  Give me a heads up if you need a cluster and assume 1/2 a day to provide from when you ask (likely quicker, but worse case..)

**Jez Tucker** - 8:51:44 AM
quick update; the nginx vision configs are not a thing
*Reactions: 👍, 👍, 👍*

**Jamie Sabino** - 12:30:12 PM
Gareth Tucker and Everyone , we will be starting on Cardiff this evening, your overnight,  Please communicate appropriately, if all goes well, we will dive right into Wycombe tomorrow (pending an agreed window_.

**Gareth Tucker** - 12:57:25 PM
All yours Jamie Sabino  re: Cardiff. Drop us an update when you are done please. Thanks.
*Reactions: 👍*

**Jamie Sabino** - 8:50:38 PM
Gareth Tucker and Everyone, AI+ 2.1 Update: Docker Service had an outage today for a significant amount of time which impacted our cicd.  Things have come back online in the last 2 hours, and things are fired back up, and I won't be able to do Cardiff overnight, i'll be tackling it first thing in the morning EST time.  I'll be working still for a couple more hours monitoring the regression testing before shipping, if its an absolute must, i'll make some coffee  .. else, it should be completed by mid day.  Hoping to get approval to target Wycombe immediately after have both done by your UK time Friday morning.  Cheers


## 9/25/2025

**Gareth Tucker** - 12:13:54 AM
Thanks for the update Jamie.


 


Everyone if anybody needs High Wycombe for a demo today, please shout here 🙂

**Orlando Richards** - 12:23:40 AM
you should get on slack - it's all managed in #highwycombelab
*Reactions: 😆*

**Orlando Richards** - 12:27:02 AM
Jamie Sabino - we have our own docker registry services which we use to avoid things like this. Something to think about once we have some spare time...
*Reactions: 👍*

**Orlando Richards** - 12:27:45 AM
(also provides a buffer against supply chain attacks)

**Jamie Sabino** - 3:46:48 PM
Gareth Tucker et Everyone , aiplus 2.1 is running on Cariff, checked space01 and qa buckets, and transcription is displaying as expected to me, but i'll let you and your team confirm, Will watch out for thumbs up and move to ALT or Wycombe as instructed.


 


I opened up a jira, on reboot, the ai+ server looses its mmfs mount, might need an expert in IRIS mmfs mounting to figure that out.. but for now, we are rocking and rolling
*Reactions: 👍*


## 9/26/2025

**Gareth Tucker** - 12:58:35 AM
Orlando Richards or anybody with access, how is it looking in #highwycombelab for demos today?


 


Ankit from the AI team is available to perform the AI+ upgrade on there today if it is free.
*Reactions: 👍, 👍*

**Orlando Richards** - 1:07:37 AM
All clear to work on the AI+ server - I've posted a notice that it will not be generating any new transcriptions today
*Reactions: 👍*

**Orlando Richards** - 1:07:50 AM
Ankit Josh(IC) - go ahead at your convenience!
*Reactions: 👍*

**Gareth Tucker** - 2:10:07 AM
Thanks Orlando Richards

**Orlando Richards** - 4:31:23 AM
Had a question about this - will any backlog of files be processed when AI+ comes back online?

**Gareth Tucker** - 4:40:10 AM
Should do Orlando

**Gareth Tucker** - 4:40:17 AM
Events will be sat in the queue waiting to be processed

**Gareth Tucker** - 4:40:54 AM
There is a TTL on the AI+ queue of 24 hours I think tho which would need to be considered
*Reactions: 👍*

**Gareth Tucker** - 4:46:20 AM
Jamie Sabino Initial feedback is that we are now getting "segments" and they are being indexed and displayed as expected.


 


There are some observations though e.g. a small change in the way the transcription is separated. Our QA team are going to pull together a list for review.

*Attachments:*
- messageReference

**Gareth Tucker** - 4:51:34 AM
Everyone today's integration meeting is cancelled whilst we continue to focus on Keycloak SSO issues and getting ready to upgrade Alt on Monday. If you have anything that you wished to raise on that call, please drop it here. Thanks.

**Gareth Tucker** - 7:36:41 AM
Jamie Sabino interim update, things were OK but we seem to have developed a problem.


 


Files are currently being processed 3 times and end with "Failed to generate answer for 'keywords' after 3 attempts. Skipping metadata generation and sending error message in payload."


 



 


{"filename": "transcribeSummarize.py", "func_name": "process", "lineno": 366, "event": "Attempt 3 of 3 failed for 'keywords': timed out", "timestamp": "2025-09-26 13:18:24", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "134098322754672", "CorrelationId": "556d5dcd-9617-4f63-b83e-af8a69eec64b", "ExternalTransactionId": ":3300357220954201602:2631154:1740016664", "JobId": "3fd1f535-b829-4bad-a7af-7423ac7ed08c", "log_level": "WARNING", "log_channel": "transcribe_summarize.transcribeSummarize"}
{"filename": "transcribeSummarize.py", "func_name": "process", "lineno": 370, "event": "Failed to generate answer for 'keywords' after 3 attempts. Skipping metadata generation and sending error message in payload.", "timestamp": "2025-09-26 13:18:24", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "134098322754672", "CorrelationId": "556d5dcd-9617-4f63-b83e-af8a69eec64b", "ExternalTransactionId": ":3300357220954201602:2631154:1740016664", "JobId": "3fd1f535-b829-4bad-a7af-7423ac7ed08c", "log_level": "ERROR", "log_channel": "transcribe_summarize.transcribeSummarize"}
{"filename": "function.py", "func_name": "wrapper", "lineno": 100, "event": "Processed transcription and summarization from /app/media/iris/qa/AI/Automation/MCS-1628/How Did The Sriracha Shortage Happen.mp4", "timestamp": "2025-09-26 13:18:24", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "134098322754672", "CorrelationId": "556d5dcd-9617-4f63-b83e-af8a69eec64b", "ExternalTransactionId": ":3300357220954201602:2631154:1740016664", "JobId": "3fd1f535-b829-4bad-a7af-7423ac7ed08c", "FunctionName": "process", "ProcessingTime": "1930.652s", "self": "<transcribe_summarize.transcribeSummarize.TranscribeSummarize object at 0x79f6202a0670>", "media_path": "/app/media/iris/qa/AI/Automation/MCS-1628/How Did The Sriracha Shortage Happen.mp4", "ReturnValueStr": "answers={'summary': \"Error: Failed to generate answer for 'summary' after 3 attempts, metadata generation skipped. Please check the MetaGen logs.\", 'keywords': \"Error: Failed to generate answer for 'k... [truncated from 5236 chars]", "log_level": "INFO", "log_channel": "aiplus.core.log.function"}
 


Vision is also showing the error in the keyword values

**Gareth Tucker** - 7:41:15 AM
we have not been able to review any further detail due to the above, but this was our initial observation of a difference between MetaGen and T&S.


 


We used to get a segment per sentence via T&S as shown below


 





 


we are now getting what appears to be a random chunk of text per segment via MetaGen

**Jamie Sabino** - 7:55:44 AM
Gareth Tucker yes, there's some "features" added believe it or not..  when/if there's a bad result, instead of pushing bogus stuff, we (for now) push an error message, this would be something we can scan and retry as results are not deterministic in our world,

**Jamie Sabino** - 7:56:12 AM
but for now, send me the file, we'll confirm on our end.. we are dealing with different gpu's down the pipeline, we'll start on our end and work through it

**Gareth Tucker** - 8:09:22 AM
it is the regular full length "How Did The Sriracha Shortage Happen.mp4" Jamie Sabino


 


You can pull it from here if you need it


 


https://ca-sn-dev-02.om.cardifflab:9505/object-listing/qa/AI%2FAutomation%2FMCS-1628%2F
*Reactions: 👍*

**Gareth Tucker** - 8:11:53 AM
the same file worked without issue earlier today in the following path


 


https://ca-sn-dev-02.om.cardifflab:9505/object-listing/qa/AI%2FAutomation%2F
*Reactions: 👍*

**Jamie Sabino** - 8:16:44 AM
focused on Wycombe at the moment (unfortunately we ran out of disk space, bit of a mess).
*Reactions: 👍*

**Jamie Sabino** - 10:52:43 AM
Gareth Tucker https://perifery.atlassian.net/browse/AI-1176 opened for the issues seen on that video,  just an fyi for tracking.
*Reactions: 👍*

**Jamie Sabino** - 11:01:20 AM
Everyone cardiff and wycombe have been updated, 1 jira raised as noted above, and wycombe is in desperate need of some storage (which i've enquired about via email to some folks).  Key thing is everything should be stable, but Wycombe is extremely likely to topple over due to disk pressure.

**Gareth Tucker** - 11:24:48 AM
Thanks for the update Jamie, what is the status with Cardiff at the moment and not generating keywords and summary?

**Jamie Sabino** - 11:35:06 AM
sorry , you mean its completely dead? or just that one file we are looking into?

**Jamie Sabino** - 11:35:14 AM
i was able to do some sample test files, and working

**Jamie Sabino** - 11:36:03 AM
just want to make sure we are in synch..  the 3 retries is new logic, the chunk data is a different item that won't be fixed , there will be a jira, which Erik needs to address with Triton

**Jamie Sabino** - 11:36:11 AM
Gareth Tucker ^

**Gareth Tucker** - 12:12:15 PM
To be fair, we were sat waiting for it to process that file over and over as Rich had dropped it a few times without knowing it would cause an issue

**Gareth Tucker** - 12:13:03 PM
Processes at near real time and 3 times for each file, we weren't able to tell whether it would process anything else

**Gareth Tucker** - 12:13:46 PM
If you get a chance, worth checking if it behaves with other files, hopefully the queue is now clear from Rich's uploads

**Jamie Sabino** - 12:15:07 PM
thanks Gareth Tucker we are on it, i don't see it completely broken, but yes, this one file does reproduce easily enough, we processed some basic files, looks good, (minus the chunking )... we are running it against different gpu's , pulling in data..

**Gareth Tucker** - 12:16:14 PM
Understood re: chunking, we can live with that one

**Jamie Sabino** - 12:17:29 PM
Same file works on our server (different GPU  ).. the chase is on

*Attachments:*
- Screenshot 2025-09-26 at 3.15.57 PM 1.png
*Reactions: 👍*

**Gareth Tucker** - 12:24:10 PM
It worked on ours earlier today too...

**Jamie Sabino** - 12:25:07 PM
to confirm "ours" means you copy of the file, but same Vision instance and this aiplus server correct Gareth Tucker?

**Jamie Sabino** - 12:25:47 PM
this is an older card.. and likely behind some of the timeouts..

**Gareth Tucker** - 12:27:38 PM
That's right, Cardiff AI+ server, same Vision instance, same file, just different time
*Reactions: 👍*

**Jamie Sabino** - 4:28:26 PM
Gareth Tucker Orlando Richards Barry Evans, have to make some changes to the ai+ server (infra level to address the disk pressure issue) , which will be risky,  I’d like to plan a slot accordingly with someone onsite in the event we need manual intervention (not certain if this is a workstation or setup with idrac). Nonetheless, Wycombe is pending Iris upgrade as well, which we can tackle at the same tim, just need to coordinate / know when any demos are scheduled.  If we know it won’t be used until Tuesday, I can tackle it over the weekend, if things go south, will need someone onsite Monday.


## 9/29/2025

**Orlando Richards** - 12:27:06 AM
Hey Jamie Sabino - the server will have an idrac substitute the .0 with a .1 in the IP address: 10.60.0.34 -> 10.60.1.34 for instance (that's for one of my dev servers).


 


Likely the credentials are root / edison2

**Orlando Richards** - 12:27:49 AM
in fact - you should probably familiarise yourself with this wiki - specifically this page: https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4497014863/hw-ngbox-gpu-02+10.60.0.179

**Gareth Tucker** - 5:20:12 AM
Everyone todays meeting has been cancelled to allow those involved to focus on the Alt Lab upgrade. Please drop a message in the chat if you would like to discuss anything. Thanks.

**Gareth Tucker** - 5:52:49 AM
Jamie Sabino FYI, we have had better luck so far today testing transcription via MetaGen v2. I took a quick scan of your Jira ticket, have we made any changes to the Cardiff instance to allow it to perform better on our GPU or is it unmodified so far?

*Attachments:*
- messageReference

**Jamie Sabino** - 5:54:25 AM
I have made no changes directly. Has someone changed the model or default setting of “combined”?

**Jamie Sabino** - 5:54:45 AM
We believe this can help, but we need to support the standard use case

**Gareth Tucker** - 5:55:44 AM
We haven't touched anything ourselves, the same video is working again though however

**Jamie Sabino** - 6:00:56 AM
let me give it a try and see if i can figure out what's going on underneath.  As for Wycombe, i need a maintenance window / day to deal with the rebuilding of the of disk (should be 2-4 hours tops but sometimes being remote makes it difficult, but i see Orlando gave me the idrac info so this should help.  As for Alt, i see you cancelled this morning's call.. need to align with that as well.

**Unknown User** - 6:04:44 AM


**Unknown User** - 6:04:51 AM


**Unknown User** - 6:04:52 AM


**Unknown User** - 6:04:53 AM


**Gareth Tucker** - 6:05:11 AM
Yeah, Orlando is out of office this afternoon, so Jez will be leading the Alt upgrade from this end

**Unknown User** - 6:05:11 AM


**Gareth Tucker** - 6:54:14 AM
Jamie Sabino something higher priority has come up on our side which means Alt will not be upgraded now today as planned, instead it will be done tomorrow. You are good to get going on upgrading the AI+ install at Alt though I believe in preparation. Let us know if you have any questions please. Thanks.
*Reactions: 👍*

**Justin Toribio** - 9:46:29 AM
Gareth Tucker Daniel Iwan I've got Facial Recognition data flowing to RMQ on Alt.  Currently only the "time-based metadata" icon appears, but no actual metadata...

**Justin Toribio** - 9:46:57 AM
I still have to clean up some of the calculations, but the payload matches the schema in terms of fields...


 


 



 


{
    "eventTime": "2025-09-27T09:19:42.052163Z",
    "eventName": "MetadataGenerated",
    "appId": "ai-plus/facial-recognition",
    "dataVersion": "1.0.0",
    "data": {
      "time-based-metadata": [
        {
          "time_start_milliseconds": 4133.333333333334,
          "time_end_milliseconds": 8033.333333333333,
          "identified_face": "Craig Underwood",
          "confidence": 0.994,
          "total_duration": "3.8999999999999995ms"
        },
        {
          "time_start_milliseconds": 10933.333333333334,
          "time_end_milliseconds": 14300.0,
          "identified_face": "Craig Underwood",
          "confidence": 0.999,
          "total_duration": "3.366666666666667ms"
        },
        {
          "time_start_milliseconds": 14400.0,
          "time_end_milliseconds": 21000.0,
          "identified_face": "Craig Underwood",
          "confidence": 0.994,
          "total_duration": "6.6ms"
        },
        {
          "time_start_milliseconds": 10933.333333333334,
          "time_end_milliseconds": 14300.0,
          "identified_face": "David Tran",
          "confidence": 0.999,
          "total_duration": "3.366666666666667ms"
        }
      ]
    },
    "tenantId": "iris",
    "source": {
      "fsInode": {
        "fsid": "5867715772291481601",
        "ino": "539941",
        "igen": "1482398833"
      },
      "s3object": {
        "endpointUrl": "https://10.100.0.1:7070",
        "bucket": "space01",
        "key": "FacialRecTesting/z_sriracha_visage_03.mp4",
        "etag": ":5867715772291481601:539941:1482398833"
      }
    }
  }

**Justin Toribio** - 9:47:41 AM
We have the following questions:



Is the metadata not displaying in the UI because the Vision instance at Alt still needs to be upgraded?  Or are there still issues with the payload being sent that need to be changed?  If so, what are they?I.e. Does all of the rounding have to match the schema exactly?: time_start, time_end, total_duration all rounded to whole numbers, confidence to 4 decimal places etc...

**Gareth Tucker** - 10:10:48 AM
Hi Justin Toribio there was an update to the RMQ handling of Facial and Object to make sure it writes sidecar files which is not in the current version on Alt. This should be addressed when the full stack gets updated tomorrow.
*Reactions: 👍*

**Gareth Tucker** - 10:12:59 AM
Once updated, it will be expecting start, end and total duration to be in milliseconds

**Gareth Tucker** - 10:14:02 AM
I think it should be ok if you drop the ms as well on total duration, but the value will still need to be in milliseconds

**Justin Toribio** - 10:15:46 AM
Gareth Tucker Great, thanks for the update.  Yep, they'll all be in milliseconds.  So:



All of the decimal places are okay?  Because it probably should be as precise as possibletotal_duration: are you saying this no longer needs to be a string?  And can be a float just like the other fields?

**Gareth Tucker** - 10:16:53 AM
The number of decimal places on confidence shouldn't matter as long as we have at least 2

**Gareth Tucker** - 10:17:42 AM
the detail gets rounded for display

**Gareth Tucker** - 10:17:47 AM


**Justin Toribio** - 10:18:58 AM
Great, same for all time fields as well?

**Gareth Tucker** - 10:21:02 AM
would need to double check, but I think total_duration is happy with or without the "ms", but it would need to be a whole number in milliseconds at the moment, not a float

**Gareth Tucker** - 10:25:22 AM
and the same goes for start_time_milliseconds and end_time_milliseconds. To be fair, millis are not needed as the UI is not that granular, everything gets rounded, but Vision is expecting millis at the moment

**Justin Toribio** - 10:32:16 AM
Ok, so this is my current understanding of the necessary format for all fields...


 






 


        {
          "time_start_milliseconds": integer in ms (i.e. 4133), 
          "time_end_milliseconds": integer in ms (i.e. 8033),
          "identified_face": string (i.e. "Craig Underwood"),
          "confidence": float of at least 2 decimals (i.e. 0.994),
          "total_duration": string object of an integer in ms, with or without the "ms" appended (i.e. "3899ms" or "3899")
        }



 


Do I have everything right?

**Gareth Tucker** - 10:36:24 AM
will need to double check total_duration with Bogdan Stanciu but the rest looks good
*Reactions: 👍*

**Justin Toribio** - 10:39:11 AM
Great, thanks.  Bogdan Stanciu please let us know about that final field when you can.

**Bogdan Stanciu** - 10:49:55 AM
Justin Toribio total_duration - string with 'ms' at the end


i.e: 


{

    "time_start_milliseconds": 5000,

    "time_end_milliseconds": 7000,

    "identified_face": "Craig Underwood",

    "confidence": 0.9583,

    "total_duration": "10000ms"

}
*Reactions: 👍, 👍, 👍*


## 9/30/2025

**Gareth Tucker** - 4:54:39 AM
Jamie Sabino FYI, looks like we developed a new problem on the Cardiff AI+ server yesterday afternoon which is preventing MetaGen results from being displayed in Vision at all now. The error we are seeing is


 



 


ErrorMessage": "Server connection reset: ConnectionResetError(104, 'Connection reset by peer')"
 


and for some more context


 



 


{"filename": "queueLogger.py", "func_name": "_log_message_publishing", "lineno": 390, "event": "RabbitMQ Message Published", "timestamp": "2025-09-29 13:47:29", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_2", "TaskId": "134098322758208", "CorrelationId": "9e15b85c-c132-4c82-9530-73b58f42dd4f", "ExternalTransactionId": ":3300357220954201602:2631245:675630748", "JobId": "0f5142c7-001e-44f0-ab93-01d9a0bf79cd", "ExchangeName": "vision-metadata-xchg", "RoutingKey": "", "PublishingTime": "0.045s", "PublishingStatus": "FAILED", "ErrorMessage": "Server connection reset: ConnectionResetError(104, 'Connection reset by peer')", "log_level": "ERROR", "log_channel": "aiplus.core.log.queue"}
{"filename": "serviceHandler.py", "func_name": "publish_result", "lineno": 185, "event": "Failed to publish result for job 0f5142c7-001e-44f0-ab93-01d9a0bf79cd: Server connection reset: ConnectionResetError(104, 'Connection reset by peer')", "timestamp": "2025-09-29 13:47:29", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_2", "TaskId": "134098322758208", "CorrelationId": "9e15b85c-c132-4c82-9530-73b58f42dd4f", "ExternalTransactionId": ":3300357220954201602:2631245:675630748", "JobId": "0f5142c7-001e-44f0-ab93-01d9a0bf79cd", "log_level": "ERROR", "log_channel": "aiplus.core.queue.serviceHandler"}
{"filename": "serviceHandler.py", "func_name": "_handle_publish_failure", "lineno": 203, "event": "Publishing failed (attempt 1), will retry: Server connection reset: ConnectionResetError(104, 'Connection reset by peer')", "timestamp": "2025-09-29 13:47:29", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_2", "TaskId": "134098322758208", "CorrelationId": "9e15b85c-c132-4c82-9530-73b58f42dd4f", "ExternalTransactionId": ":3300357220954201602:2631245:675630748", "JobId": "0f5142c7-001e-44f0-ab93-01d9a0bf79cd", "log_level": "WARNING", "log_channel": "aiplus.core.queue.serviceHandler"}
Callback <OneShotCallback: cb=<bound method RobustChannel._on_close of <aio_pika.robust_channel.RobustChannel object at 0x79f620286ec0>>> error
Traceback (most recent call last):
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/tools.py", line 306, in __task_inner
    await self.callback(*args, **kwargs)
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/robust_channel.py", line 119, in _on_close
    await self.restore()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/robust_channel.py", line 94, in restore
    await self.reopen()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/robust_channel.py", line 132, in reopen
    await super().reopen()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/channel.py", line 244, in reopen
    await self._open()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/channel.py", line 173, in _open
    channel = await UnderlayChannel.create(
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/abc.py", line 485, in create
    channel = await connection.channel(**kwargs)
  File "/usr/local/lib/python3.10/dist-packages/aiormq/connection.py", line 918, in channel
    raise RuntimeError("%r closed" % self)
RuntimeError: <Connection: "amqps://x8dkh453g8BB:******@10.20.0.162:5671//?heartbeat=600&blocked_connection_timeout=300&connection_name=metagen-publisher-69da7ad9" at 0x79f6308e6570> closed
{"filename": "baseHandler.py", "func_name": "disconnect", "lineno": 148, "event": "RabbitMQ publisher disconnected", "timestamp": "2025-09-29 13:47:29", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_2", "TaskId": "134098322758208", "CorrelationId": "9e15b85c-c132-4c82-9530-73b58f42dd4f", "ExternalTransactionId": ":3300357220954201602:2631245:675630748", "JobId": "0f5142c7-001e-44f0-ab93-01d9a0bf79cd", "log_level": "INFO", "log_channel": "aiplus.core.queue.baseHandler"}
{"filename": "serviceHandler.py", "func_name": "stop", "lineno": 54, "event": "RabbitMQ publisher stopped", "timestamp": "2025-09-29 13:47:29", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_2", "TaskId": "134098322758208", "CorrelationId": "9e15b85c-c132-4c82-9530-73b58f42dd4f", "ExternalTransactionId": ":3300357220954201602:2631245:675630748", "JobId": "0f5142c7-001e-44f0-ab93-01d9a0bf79cd", "log_level": "INFO", "log_channel": "aiplus.core.queue.serviceHandler"}
 


It looks like somebody else may have been in there testing around the same time and MetaGen was shutdown and restarted later in the day


 



 


INFO:     Shutting down
INFO:     Waiting for application shutdown.
{"filename": "consulServiceDiscovery.py", "func_name": "deregister_service", "lineno": 338, "event": "Deregistered service from Consul", "timestamp": "2025-09-29 15:04:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "134098324120368", "ServiceId": "metagen-036fbf4e-9e5f-4a3b-8b38-350853f369ee", "log_level": "INFO", "log_channel": "aiplus.core.discovery.consulServiceDiscovery"}
{"filename": "serviceRegistration.py", "func_name": "deregister_service", "lineno": 259, "event": "Service deregistered successfully", "timestamp": "2025-09-29 15:04:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "134098324120368", "ServiceId": "metagen-036fbf4e-9e5f-4a3b-8b38-350853f369ee", "log_level": "INFO", "log_channel": "aiplus.core.discovery.serviceRegistration"}
{"filename": "baseHandler.py", "func_name": "disconnect", "lineno": 148, "event": "RabbitMQ publisher disconnected", "timestamp": "2025-09-29 15:04:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "134098324120368", "log_level": "INFO", "log_channel": "aiplus.core.queue.baseHandler"}
{"filename": "serviceHandler.py", "func_name": "stop", "lineno": 54, "event": "RabbitMQ publisher stopped", "timestamp": "2025-09-29 15:04:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "134098324120368", "log_level": "INFO", "log_channel": "aiplus.core.queue.serviceHandler"}
{"filename": "httpClientManager.py", "func_name": "shutdown", "lineno": 474, "event": "Closed 0 HTTP clients during shutdown", "timestamp": "2025-09-29 15:04:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "134098324120368", "log_level": "INFO", "log_channel": "aiplus.core.http.httpClientManager"}
INFO:     Application shutdown complete.
INFO:     Finished server process [51652]
Task was destroyed but it is pending!
 


We are still seeing the same problem today for all newly dropped files


 


 



 


ree"}, {"start": 18.64, "end": 18.8, "text": "years,"}, {"start": 18.96, "end": 19.2, "text": "when"}, {"start": 19.2, "end": 19.36, "text": "it"}, {"start": 19.36, "end": 19.6, "text": "was"}]}, {"text": "increasing by 40 or 50 percent a year to the point where in 2015 we had 2,000 acres of jalapenos and we delivered 100 million. million.", "start": 19.6, "end": 29.76, "words": [{"start": 19.6, "end": 20.24, "text": "increasing"}, {"start": 20.24, "end": 20.4, "text": "by"}, {"start": 20.4, "end": 20.8, "text": "40"}, {"start": 20.8, "end": 20.88, "text": "or"}, {"start": 20.88, "end": 21.2, "text": "50"}, {"start": 21.2, "end": 21.6, "text": "percent"}, {"start": 21.6, "end": 21.84, "text": "a"}, {"start": 21.84, "end": 22.08, "text": "year"}, {"start": 22.4, "end": 22.64, "text": "to"}, {"start": 22.64, "end": 22.8, "text": "the"}, {"start": 22.8, "end": 23.04, "text": "point"}, {"start": 23.04, "end": 23.36, "text": "where"}, {"start": 23.36, "end": 23.6, "text": "in"}, {"start": 23.6, "end": 24.8, "text": "2015"}, {"start": 25.36, "end": 25.52, "text": "we"}, {"start": 25.52, "end": 25.76, "text": "had"}, {"start": 25.76, "end": 26.48, "text": "2,000"}, {"start": 26.48, "end": 27.04, "text": "acres"}, {"start": 27.04, "end": 27.28, "text": "of"}, {"start": 27.28, "end": 28.4, "text": "jalapenos"}, {"start": 28.56, "end": 28.72, "text": "and"}, {"start": 28.72, "end": 28.8, "text": "we"}, {"start": 28.8, "end": 29.2, "text": "delivered"}, {"start": 29.2, "end": 29.52, "text": "100"}, {"start": 29.52, "end": 29.68, "text": "million."}, {"start": 29.68, "end": 29.76, "text": "million."}]}], "language": "en", "error": null}}, "tenantId": "iris", "source": {"fsInode": {"fsid": "3300357220954201602", "ino": "279533", "igen": "165691763"}, "s3object": {"endpointUrl": "https://10.222.222.2:7070", "bucket": "space01", "key": "Gareth/Testing/Transcription Segments/Sriracha_30_2025093002.mp4", "etag": ":3300357220954201602:279533:165691763"}}}, "log_level": "INFO", "log_channel": "aiplus.core.log.queue"}
{"filename": "queueLogger.py", "func_name": "_log_message_publishing", "lineno": 390, "event": "RabbitMQ Message Published", "timestamp": "2025-09-30 10:58:21", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135374268734432", "CorrelationId": "8698f69e-5cec-4f00-9b3a-6b6e366ea42f", "ExternalTransactionId": ":3300357220954201602:279533:165691763", "JobId": "7ffc427d-7cbc-4323-952b-8c32c604a640", "ExchangeName": "vision-metadata-xchg", "RoutingKey": "", "PublishingTime": "0.001s", "PublishingStatus": "FAILED", "ErrorMessage": "Server connection reset: ConnectionResetError(104, 'Connection reset by peer')", "log_level": "ERROR", "log_channel": "aiplus.core.log.queue"}
{"filename": "serviceHandler.py", "func_name": "publish_result", "lineno": 185, "event": "Failed to publish result for job 7ffc427d-7cbc-4323-952b-8c32c604a640: Server connection reset: ConnectionResetError(104, 'Connection reset by peer')", "timestamp": "2025-09-30 10:58:21", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135374268734432", "CorrelationId": "8698f69e-5cec-4f00-9b3a-6b6e366ea42f", "ExternalTransactionId": ":3300357220954201602:279533:165691763", "JobId": "7ffc427d-7cbc-4323-952b-8c32c604a640", "log_level": "ERROR", "log_channel": "aiplus.core.queue.serviceHandler"}
{"filename": "serviceHandler.py", "func_name": "_handle_publish_failure", "lineno": 203, "event": "Publishing failed (attempt 1), will retry: Server connection reset: ConnectionResetError(104, 'Connection reset by peer')", "timestamp": "2025-09-30 10:58:21", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135374268734432", "CorrelationId": "8698f69e-5cec-4f00-9b3a-6b6e366ea42f", "ExternalTransactionId": ":3300357220954201602:279533:165691763", "JobId": "7ffc427d-7cbc-4323-952b-8c32c604a640", "log_level": "WARNING", "log_channel": "aiplus.core.queue.serviceHandler"}
Callback <OneShotCallback: cb=<bound method RobustChannel._on_close of <aio_pika.robust_channel.RobustChannel object at 0x7b1f344dc730>>> error
Traceback (most recent call last):
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/tools.py", line 306, in __task_inner
    await self.callback(*args, **kwargs)
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/robust_channel.py", line 119, in _on_close
    await self.restore()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/robust_channel.py", line 94, in restore
    await self.reopen()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/robust_channel.py", line 132, in reopen
    await super().reopen()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/channel.py", line 244, in reopen
    await self._open()
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/channel.py", line 173, in _open
    channel = await UnderlayChannel.create(
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/abc.py", line 485, in create
    channel = await connection.channel(**kwargs)
  File "/usr/local/lib/python3.10/dist-packages/aiormq/connection.py", line 918, in channel
    raise RuntimeError("%r closed" % self)
RuntimeError: <Connection: "amqps://x8dkh453g8BB:******@10.20.0.162:5671//?heartbeat=30&blocked_connection_timeout=300&connection_name=metagen-publisher-6c936ab0" at 0x7b1fe42dfe70> closed
{"filename": "baseHandler.py", "func_name": "disconnect", "lineno": 148, "event": "RabbitMQ publisher disconnected", "timestamp": "2025-09-30 10:58:21", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135374268734432", "CorrelationId": "8698f69e-5cec-4f00-9b3a-6b6e366ea42f", "ExternalTransactionId": ":3300357220954201602:279533:165691763", "JobId": "7ffc427d-7cbc-4323-952b-8c32c604a640", "log_level": "INFO", "log_channel": "aiplus.core.queue.baseHandler"}
{"filename": "serviceHandler.py", "func_name": "stop", "lineno": 54, "event": "RabbitMQ publisher stopped", "timestamp": "2025-09-30 10:58:21", "ComponentName": "MetaGen", "ThreadName": "ThreadPoolExecutor-0_0", "TaskId": "135374268734432", "CorrelationId": "8698f69e-5cec-4f00-9b3a-6b6e366ea42f", "ExternalTransactionId": ":3300357220954201602:279533:165691763", "JobId": "7ffc427d-7cbc-4323-952b-8c32c604a640", "log_level": "INFO", "log_channel": "aiplus.core.queue.serviceHandler"}
Task was destroyed but it is pending!
task: <Task pending name='Task-386552' coro=<OneShotCallback.__task_inner() running at /usr/local/lib/python3.10/dist-packages/aio_pika/tools.py:306>>
Exception ignored in: <coroutine object OneShotCallback.__task_inner at 0x7b1eee27b990>
Traceback (most recent call last):
  File "/usr/local/lib/python3.10/dist-packages/aio_pika/tools.py", line 310, in __task_inner
    self.loop.call_soon(self.finished.set)
  File "/usr/lib/python3.10/asyncio/base_events.py", line 753, in call_soon
    self._check_closed()
  File "/usr/lib/python3.10/asyncio/base_events.py", line 515, in _check_closed
    raise RuntimeError('Event loop is closed')
RuntimeError: Event loop is closed
 


 


and we have also checked the RabbitMQ logs for any clues there but nothing logs when MetaGen reports it's error.


 


FYI, others applications are still delivering messages successfully to the same RabbitMQ queue so the issue looks to be isolated to AI+ at the moment.


 


As mentioned above, the file doesn't seem to matter on this occasion, all files seem to be affected.


 


Please let us know if you need any further info. Thanks.

**Daniel Iwan** - 5:06:02 AM
possibly a small hint there where RabbitMQ closes connection to the client due to its heartbeat failure. It is possible that client is blocking I/O loop of Pika library. See similar reports here https://github.com/rabbitmq/rabbitmq-server/discussions/13627


This may be red herring or maybe it was always there we just have not seen it yet

**Jamie Sabino** - 5:07:29 AM
Gareth Tucker yes I was looking into this, it definitely happens all the time with the long transcripts, but the short files were working,  in the rabbitmq logs you will see heartbeat timeout issue to the aiplus server, so I started there, but the config change didn’t do anyway. At that point I switched to alt and need to get back to it.  I’m leaning towards a network related issue ,  (we have a jira for that as well on me, note this is the only lab that experiences this issue out of our 4 deployed sites ). And we know there is something blocking / slowing traffic in Cardiff only, and my hunch is that’s related.

**Gareth Tucker** - 5:09:05 AM
slowing internal traffic, or just external comms pulling from the Internet?

**Jamie Sabino** - 5:12:01 AM
That’s what I need to start analyzing but this will likely take significant time… likely start with capturing a tcp dump/ wire shark.  Basic network checks check out ok.  Also, we are not going to support that card you have (now mind you AlT has the same card, it can only be used for basic testing).

**Jamie Sabino** - 5:13:56 AM
Might be best you folks use the FTL vision stack for integration testing and full / large size file testing given we have a supported GPU there,

**Gareth Tucker** - 5:16:30 AM
OK, I am not sure I would bundle those 2 comms issues together but it is something to consider.

**Gareth Tucker** - 5:19:03 AM
We will need to be able to test end to end in Cardiff even if just for basic regression, so I am still very interested in any tuning that can be done to get MetaGen v2 to work more reliably on our card.

**Gareth Tucker** - 5:19:36 AM
Are we saying that Alt is also going to suffer with the same issue as it has the same card?
*Reactions: 👍*

**Jamie Sabino** - 5:19:39 AM
Payload size and rmq timeout? I would agree but that’s where the logs started, 5 out of 5 small files no issue, each time the large file process timeouts with Pixstore rabbit service closing the connection.  Thats the only data points I started with

**Jamie Sabino** - 5:20:46 AM
Correct, alt will need to be updated , we can do face rec etc, but transcription / metagen will be just best effort, and extremely slow if even we make an effort to fix it.

*Attachments:*
- messageReference

**Jamie Sabino** - 5:21:06 AM
We won’t be selling those cards,

**Gareth Tucker** - 5:23:24 AM
OK, it sounds like this is going to be a problem for demo of existing features at Alt

**Jamie Sabino** - 5:23:46 AM
Small files will work,

**Gareth Tucker** - 5:24:43 AM
but a lot slower than we are used to?

**Jamie Sabino** - 5:25:39 AM
This  is noted in the ticket, discussed with Jason Perr yesterday, but the understanding is we are not going to invest time in supporting these legacy cards.   That said, we are still analyzing a but as of last night at alt.

**Jamie Sabino** - 5:26:41 AM
Yes the default “combined” option is much slower , you can change the settings but this isn’t ideal for a cicd.

**Jamie Sabino** - 5:27:04 AM
Are you guys finished with Alt? Is it updated

**Gareth Tucker** - 5:27:38 AM
Orlando Richards is handling that, I will let him update when ready.

**Orlando Richards** - 5:39:01 AM
Sep 30 05:38:05 alt-mn-001 docker[574300]: metadata-api-1  |
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  | 2025-09-30T12:38:06.014Z ERROR 1 --- [ntContainer#0-1] c.o.m.m.m.v.VisionMetadataEventConsumer  : Failed to process event. Failure non retryable. Event: VisionMetadataEvent [eventTime=2025-09-30T12:38:06.009Z, eventName=MetadataGenerated, appId=ngeneahub/mediainfo, tenantId=iris, source=Source[s3object=SourceS3Object [endpointUrl=https://10.100.0.1:7070, bucket=space01, key=Footage/BMD17K/exr/8192x7520/BMD_17K_LBPV_tempCC1_v03_8192x7520.087412.exr, etag=:5867715772291481601:529062:1026746443, mtime=1753920445390]], dataVersion=1.0.0, data={"creatingLibrary":{"name":"MediaInfoLib","version":"23.09","url":"https://mediaarea.net/MediaInfo"},"media":{"@ref":"/mmfs1/data/space01/Footage/BMD17K/exr/8192x7520/BMD_17K_LBPV_tempCC1_v03_8192x7520.087412.exr","track":[{"ImageCount":"1","Format":"EXR","Format_Version":"2","StreamSize":"0"},{"Format":"EXR","Format_Version":"2","Format_Profile":"Line","Format_Compression":"raw","Width":"8192","Height":"7520","PixelAspectRatio":"1.000","DisplayAspectRatio":"1.089","Compression_Mode":"Lossless","StreamSize":"369743870"}]}}]
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  |
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  | org.springframework.security.oauth2.client.ClientAuthorizationException: [unauthorized_client] Invalid client or Invalid client credentials
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  |         at org.springframework.security.oauth2.client.ClientCredentialsReactiveOAuth2AuthorizedClientProvider.lambda$authorize$0(ClientCredentialsReactiveOAuth2AuthorizedClientProvider.java:86) ~[spring-security-oauth2-client-6.4.6.jar:6.4.6]
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  |         Suppressed: reactor.core.publisher.FluxOnAssembly$OnAssemblyException:
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  | Error has been observed at the following site(s):
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  |         *__checkpoint ⇢ Request to POST https://mapi:8500/mapi/v1/storage-access/auth [DefaultWebClient]
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  | Original Stack Trace:
Sep 30 05:38:06 alt-mn-001 docker[574300]: metadata-api-1  |                 at org.springframework.security.o



anyone fancy having a guess as to which bit of the stack that's upset about?

**Orlando Richards** - 5:41:24 AM
opensearch maybe?

**Orlando Richards** - 5:41:42 AM
also got this when uploading a file:






 


[Error] File: spacex-PIOgkhaF3WA-unsplash.jpg - Object created but error adding metadata: Error 500. Failed updating object with application metadata. Cause: [unauthorized_client] Invalid client or Invalid client credentials

**Orlando Richards** - 5:43:23 AM
Gareth Tucker Daniel Iwan - i reckon i'm out of my comfort zone now - reckon you could have a look on Alt and try to find the problem between vision and opensearch?

**Gareth Tucker** - 5:43:48 AM
sure, we'll need Daniel Iwan on that one I think
*Reactions: 👍*

**Orlando Richards** - 5:44:07 AM
the deployment is on https://192.168.18.10/

**Orlando Richards** - 5:52:44 AM
other than that - i think i'm pretty much done

**Orlando Richards** - 5:53:02 AM
the gpfs clients on the non-pixstor nodes would benefit from an upgrade, but I'll see if one of the services guys can handle that

**Jamie Sabino** - 5:54:25 AM
Orlando Richards you test the ai service with a basic file? I got it loaded up yesterday, but my gut tells me its in a bad state with some dev changes for non supported features Justin and Jason are working on, but i'll get that sorted if so.

**Orlando Richards** - 5:54:41 AM
no, haven't touched ai+

**Orlando Richards** - 5:55:01 AM
until the opensearch hookup from Vision is working though, I'd steer clear Jamie Sabino

**Jamie Sabino** - 5:55:18 AM
ack ^

**Orlando Richards** - 5:55:50 AM
AI+ may well get exercised just through "business as normal" though, as the content ingests have been reset

**Jamie Sabino** - 5:56:25 AM
its a holiday here in Canada, but want this done.  I'm going to spend a little time on Cardiff quickly to see if we can diagnose the underlying rabbit connection drops.

**Daniel Iwan** - 5:56:51 AM
is it default credentials? I have troubles to ssh to it?

*Attachments:*
- messageReference

**Jamie Sabino** - 6:18:06 AM
Daniel Iwan i can't login as well with default cred listed in confluence r**/e**2

**Jamie Sabino** - 6:21:25 AM
(worked yesterday  )

**Orlando Richards** - 6:25:42 AM
pixadmin / edison2

**Orlando Richards** - 6:25:51 AM
for the ui

**Orlando Richards** - 6:25:57 AM
for logging in to ssh.... lemme check

**Orlando Richards** - 6:26:31 AM
root/edison2 - it's on the customer vpn: 


 






 


[DMZ orichards@openvpn02 ~]$ ssh root@alt-mn-001.altsystems_lab
root@alt-mn-001.altsystems_lab's password:
*Reactions: 👍*

**Daniel Iwan** - 6:57:37 AM
thanks, we need to check oauth creds, where can we get master creds for Keycloak from?

**Orlando Richards** - 7:03:16 AM
Grab the password with:



 


salt-call pixpillar.get_obfuscated keycloak:users:pixstor_admin:password
 



The user is pixstor_admin
*Reactions: 👍*

**Daniel Iwan** - 7:16:15 AM
Orlando Richards did you install twice on Alt by any change? possibly mcs Keycloak clients were already in place?

**Orlando Richards** - 7:17:53 AM
hmm - quite possible

**Gareth Tucker** - 7:17:55 AM
we also need some help on proxy gen Orlando Richards if you are about?

**Orlando Richards** - 7:18:15 AM
i am indeed

**Gareth Tucker** - 7:18:28 AM
will pull you into our call

**Daniel Iwan** - 7:40:38 AM
we may have some misconfiguration in Rabbit , we got FileCreate events in metadata-exchange Orlando Richards . Would that be related to snapshots, or something else?

**Orlando Richards** - 7:48:01 AM
Jez Tucker will need to field rabbit exchange hub workflow things

**Orlando Richards** - 7:48:06 AM


**Orlando Richards** - 7:52:53 AM
We're getting a lot of OOM events for ffmpeg

**Orlando Richards** - 7:53:01 AM
[Tue Sep 30 07:36:31 2025] Memory cgroup out of memory: Killed process 1429588 (ffmpeg) total-vm:3319352kB, anon-rss:1200928kB, file-rss:17876kB, shmem-rss:0kB, UID:1002 pgtables:5116kB oom_score_adj:0

**Orlando Richards** - 7:53:43 AM
because it's saying "Memory cgroup out of memory" that suggests that this is hitting a safety net and not bringing the node down (which is nice!)

**Orlando Richards** - 7:53:46 AM
but still...

**Orlando Richards** - 7:55:05 AM
is that likely to be the default 4gb memory limit on the media-transformer-engine container Daniel Iwan?

**Orlando Richards** - 7:55:23 AM
i wish ffmpeg had a "please don't use all the memory" option...

**Gareth Tucker** - 7:55:24 AM
yeah

**Gareth Tucker** - 7:55:56 AM
if I recall, Barry tweaked the settings I think the last time we re-indexed alt

**Orlando Richards** - 7:56:00 AM
should we just ignore them?

**Erik Salter** - 7:57:02 AM
That's OOM Killer.  That's the OS killing off the process.

**Orlando Richards** - 7:57:28 AM
Yes - it's the limit imposed by the cgroups on the container which is running the ffmpeg Erik Salter

**Orlando Richards** - 7:57:36 AM
the question is - what's the impact of letting them fail?

**Gareth Tucker** - 7:57:52 AM
looks like we re-configured to 32GB Orlando

**Orlando Richards** - 7:58:02 AM
the node has about 150GB of free ram - so no harm in boosting it!
*Reactions: 😆*

**Orlando Richards** - 7:58:09 AM
is that just manually editing the compose file Gareth Tucker?

**Gareth Tucker** - 7:58:52 AM
yeah, there is 2 of them

**Orlando Richards** - 7:59:00 AM
i've found: mcs-media-transformer-engine/compose.yml
*Reactions: 👍*

**Orlando Richards** - 8:04:22 AM
someone should write a memory-efficient ffmpeg....

**Jez Tucker** - 8:40:58 AM
well, you can pass it -threads, instead of auto, which will lower the ram at the cost of performance

**Orlando Richards** - 8:56:52 AM
Unrecognized option 'threads'.


## 10/1/2025

**Jez Tucker** - 1:52:42 AM
we have a new versity package available to resolve the too many folder continuation issue.


yum -y update versity-ngenea will drop on 1.0.18-1 and restarting the versitygw services will do it, or happy to service at a suitable point
*Reactions: 👍*

**Daniel Iwan** - 2:12:18 AM
doing it on dev-02

**Daniel Iwan** - 3:50:46 AM
Jez Tucker looks like upgrade fixed the continuation issue. A small gotch is that iris service did not get restarted automatically on our dev-02 so we did not see the change. Also from David Bridger






 


all the directories from previous pages are no longer listed. But the first item on every page is always what's specified in the prefix parameter.

**Jez Tucker** - 5:33:41 AM
no, it does not restart automatically  ^^ "and restarting the versitygw services" is a manual step

**Jez Tucker** - 5:37:19 AM
David Bridger can you add some more insight for me please?  what call are you doing; what is the response; what is the expectation re: "But the first item on every page is always what's specified in the prefix parameter.".  I can then take that back to Tony.

**Gareth Tucker** - 5:42:18 AM
Jez Tucker not sure if linked to the upgrade earlier, but we cannot list the qa Space via Versity at the moment on Dev 02, just getting an error 400 in Vision at the mo


 






 


Failed listing S3 objects: The specified bucket is not valid. (Service: S3, Status Code: 400, Request ID: )



 


and the Versity log is not much help either


 



 


Oct 01 13:39:54 ca-sn-dev-02 versitygw-iris[2168274]: 13:39:54 | 400 |     203.893µs | 10.222.222.2 | GET | /qa | - | list-type=2&delimiter=%2F&max-keys=50&prefix=

**David Bridger** - 5:46:09 AM
Jez Tucker I've added a comment on the initial jira https://perifery.atlassian.net/browse/MCS-1648?focusedCommentId=323195 with an example.

**Jamie Sabino** - 7:33:13 AM
Orlando Richards is ALT ready? I'm trying to login to vision, but i think the url's have changed possibly, i'm referencing https://arcapix.atlassian.net/wiki/spaces/Labs/pages/5029986307/ALT+Lab+Environment and our https://perifery.atlassian.net/wiki/spaces/IRIS/pages/4452286475/HW+Prod+Cluster+-+Iris , is there a new page?

**Orlando Richards** - 7:34:29 AM
Hey Jamie Sabino - not sure where Jez Tucker left the incremental stuff. You'll need a new rabbitmq user+pass for sure though.

**Orlando Richards** - 7:34:53 AM
what's not working for you when you try to log in ? What address + credentials are you using?

**Jamie Sabino** - 7:35:58 AM
the above confluence pages ^ one shows https://192.168.18.10:9505/, and the other shows https://192.168.18.10:8443/ .  Sounds like we left ALT broken/down over night?

**Orlando Richards** - 7:36:06 AM
i've updated the doc

**Jamie Sabino** - 7:36:36 AM
once its finalized, we'll move it to the IRIS space, but let me check what's changed

**Orlando Richards** - 7:37:01 AM
you don't use port 9505 any more

**Orlando Richards** - 7:37:09 AM
what's 8443 for?

**Orlando Richards** - 7:37:16 AM
i don't see that in the doc...

**Jamie Sabino** - 7:37:45 AM


*Attachments:*
- Screenshot 2025-10-01 at 10.37.30 AM.png

**Orlando Richards** - 7:37:46 AM
oh - that's a different wiki

**Orlando Richards** - 7:37:51 AM
i'd delete that page if i were you

**Orlando Richards** - 7:38:03 AM
otherwise it'll drift from the "definitive" reference doc

**Orlando Richards** - 7:38:20 AM
which is this one:


https://arcapix.atlassian.net/wiki/spaces/Labs/pages/5029986307/ALT+Lab+Environment

**Jamie Sabino** - 7:38:23 AM
no, its old, we migrated to IRIS space for wycombe, cardiff ftl, we'll push the finalized alt ones there

**Orlando Richards** - 7:38:52 AM
The Wycombe cluster is documented here: https://arcapix.atlassian.net/wiki/spaces/Labs/pages/4497014893/Wycombe+Production+Cluster

**Orlando Richards** - 7:38:57 AM
anything else is likely out of date already

**Jamie Sabino** - 7:39:15 AM
the url you added "https://192.168.18.10:9505/" doesn't resolve.

**Orlando Richards** - 7:39:32 AM
i didn't add that url - i removed it

**Jamie Sabino** - 7:39:33 AM
getting an nginx failure

**Orlando Richards** - 7:39:37 AM
uff

**Orlando Richards** - 7:39:48 AM
confluence changed the link text, but not the actual link

**Orlando Richards** - 7:39:49 AM
please hold
*Reactions: 👍*

**Orlando Richards** - 7:40:22 AM
try now

**Orlando Richards** - 7:41:18 AM
Only the periodic ingests are currently disabled - everything else should be fine

*Attachments:*
- messageReference

**Jamie Sabino** - 7:41:43 AM
the link takes me to Ngenea

**Orlando Richards** - 7:42:04 AM
screenshot?

**Jamie Sabino** - 7:42:49 AM
it pops up with a new login screen, i selected IRIS, added the cred, and it redirected to ngenea

**Jamie Sabino** - 7:42:51 AM


*Attachments:*
- Screenshot 2025-10-01 at 10.41.56 AM.png

**Orlando Richards** - 7:44:36 AM
ok - i'll need to check that out. In the meantime, stick "/iris/" on the end of the url
*Reactions: 👍*

**Jez Tucker** - 8:13:40 AM
I am starting to look at at lab upgrade


we have the hub beta2, doing an upgrade test on an internal node before I push it onto alt

**Jez Tucker** - 8:14:01 AM
likely done or nogo before 18.00 london

**Jez Tucker** - 8:29:39 AM
David Bridger  much ta.  I'll have a looksie.

*Attachments:*
- messageReference

**Orlando Richards** - 8:40:01 AM
This is sorted now - you get the new index page when hitting the top of the web server:

*Attachments:*
- messageReference
*Reactions: 👍*

**Jamie Sabino** - 9:01:53 AM
Everyone, who's leading the ALT Iris upgrade from the "Iris" point of view?  Getting 404, and a 500 red pop up on vault, secondly, it appears nothing is being sent to the aiplus queue, (not sure if this was due to the current issue or not, as it was working about 30 minutes ago).. just want to synch or know who's going to say "its ready", so we can do our work for final integration

**Jamie Sabino** - 9:02:27 AM


*Attachments:*
- Screenshot 2025-10-01 at 12.02.12 PM.png

**Orlando Richards** - 9:02:51 AM
Jez Tucker is doing the final pieces, including a hub upgrade just now

**Jez Tucker** - 9:03:02 AM
indeed so

**Orlando Richards** - 9:03:03 AM
pretty good chance that's the source of the 500 errors

**Jez Tucker** - 9:03:39 AM
I will update shortly


Got a test file you want me to duplicate as a test notify ?

**Jamie Sabino** - 9:03:44 AM
thanks Orlando Richards and Jez Tucker, i'll switch focus.. please DM me here once you folks say "its good to go", e

**Orlando Richards** - 9:04:08 AM
i'm hands off - it's all Jez now

**Jamie Sabino** - 9:04:20 AM
we love our little sriracha video ,

*Attachments:*
- messageReference

**Jez Tucker** - 9:04:44 AM
np

**Jamie Sabino** - 9:05:11 AM
here it is, but its already in space01 there

*Attachments:*
- 000001-jsTestOct1.mp4

**Jason Perr** - 10:24:57 AM
Gareth Tucker There seems to be an issue with the AI+ server hardware. It seems that the GPU is running at PCIe 1.0 speeds even though it has PCIe 4.0. This is the info I was able to determine so far. Does the server have LOM? Or can someone physically on site check the BIOS?


 


Both sides (motherboard slot and GPU) support high speeds but are negotiating to the slowest possible speed. No PCIe errors in dmesg, so this is likely a BIOS/firmware configuration issue.


Solutions (in order of likelihood):
1. Check BIOS PCIe Settings (Most Likely Fix)
Reboot and enter BIOS/UEFI, look for:



PCIe Speed/Link Speed: Set to Auto or Gen 4 (not Gen 1)PCIe Slot Configuration: Ensure slot is not limitedAbove 4G Decoding: EnableResizable BAR (ReBAR): Enable (optional but recommended)

**Jason Perr** - 10:25:19 AM
This is what we are seeing at the moment:


aiuser@cardiff-ai:~/.aiplus/aiplusLogging$ sudo lspci -vvv -s 00:01.0 | grep -E "^00:01|LnkCap:|LnkSta:"

00:01.0 PCI bridge: Intel Corporation Device a70d (rev 01) (prog-if 00 [Normal decode])

                LnkCap: Port #2, Speed 32GT/s, Width x16, ASPM not supported

                LnkSta: Speed 2.5GT/s (downgraded), Width x16 (ok)

**Jason Perr** - 10:25:39 AM
The most important info is this:


LnkSta: Speed 2.5GT/s (downgraded),

**Gareth Tucker** - 10:26:30 AM
ok, we can get somebody to take a look at that in the morning
*Reactions: 👍*

**Gareth Tucker** - 10:26:44 AM
it's just a regular tower PC not a rack mounted server

**Jez Tucker** - 10:43:09 AM
Jamie Sabino  we are going to rebaseline all the snapshots/files for ingest, but AI+ already has its own full queues.  Are you able to nuke your AI+ queues so we can send them all through again?  else you'll be waiting ages

**Jamie Sabino** - 10:44:47 AM
Jez Tucker yes, we saw that  , we can nuke, but is this always going to be the upgrade path? I know it happened at Wycombe, but i thought we were going to address that

**Jamie Sabino** - 10:45:18 AM
if we blow them away, and redo them all, we will be in the same position won't we?

**Jez Tucker** - 10:45:31 AM
only if you want to reprocess the data


if you do not, we can leave the 'now' as is

**Jez Tucker** - 10:45:59 AM
believe the intent was to re-test the updates, so you'd want to reprocess all the data?

**Jamie Sabino** - 10:46:19 AM
what is the final state here?

**Jamie Sabino** - 10:46:34 AM
are we always going to reprocess all metadata for every upgrade of IRIS?

**Jamie Sabino** - 10:47:05 AM
if so we have to architect that / design that a bit..

**Jez Tucker** - 10:47:21 AM
it's nothing to so with iris


if ai+ has changed and needs to reprocess the data, we need to send the file notifications for the data again

**Gareth Tucker** - 10:47:50 AM
This was a fresh install too, so it is necessary if we want all the existing data to have metadata

**Jamie Sabino** - 10:47:52 AM
hmmm.. not sure if that's exactly correct..

**Jez Tucker** - 10:47:56 AM
if we don't need to, that's cool. any new files will be picked up from now on

**Jamie Sabino** - 10:48:22 AM
i get it, its not a big deal today, but what does this look like in the future..

**Barry Evans** - 10:48:34 AM
if you have processed a file

**Jamie Sabino** - 10:48:37 AM
that was the question i posed when this happened at Wycombe

**Jez Tucker** - 10:48:38 AM
oic. vision db was emptied. 


so yes .. it was agreed on the thu call last week(?) that alt lab would be culled
*Reactions: 👍*

**Barry Evans** - 10:48:44 AM
and you change what is being pulled

**Barry Evans** - 10:48:53 AM
then you will have to process the file again

**Barry Evans** - 10:49:03 AM
if you haven't changed it

**Barry Evans** - 10:49:09 AM
you will not need to reprocess it again

**Barry Evans** - 10:49:54 AM
that is the future state

**Barry Evans** - 10:49:58 AM
and the present state

**Barry Evans** - 10:50:18 AM
what changes is the ease of doing the upgrade in the first place

**Jez Tucker** - 10:50:20 AM
yep.


but on top of that the vision upgrade emptied the db


so vision does not have the metadata (from this upgrade...)


so we do need to reprocess, I believe the ask is Gareth Tucker?

**Jamie Sabino** - 10:50:45 AM
i'm confused, but for a later date,  Jason Perr fyi, need to look at expectations here , sounds like we need to scan all of the /mmfs of the deployment and check for required reprocessing?

**Barry Evans** - 10:51:22 AM
if you change a prompt, or add new functionality, you are going to have to process it again

**Barry Evans** - 10:51:34 AM
unless you dont want that metadata against the current data sets and only new data

**Jamie Sabino** - 10:52:53 AM
we wouldn't do that Barry Evans, customer drives this, are we saying that "I'm a customer and i want to change the model, prompt, and i need to re-process all assets" or "I'm a customer and i want to change the model, prompt, and i only want future assets being processed with this state forward"

**Jamie Sabino** - 10:53:39 AM
for now, yes, i'll blow away all the queues, and lets redo /resynch it all with our new baseline default config..

**Jez Tucker** - 10:53:46 AM
that's be great

**Gareth Tucker** - 10:53:59 AM
That was my understanding, we agreed to wipe as that was the easiest way to upgrade Alt, therefore if we want metadata for existing files, then we need to re-process them all

*Attachments:*
- messageReference

**Jez Tucker** - 10:54:06 AM
let me know and I'll remove the snaps and locks our side and restart the schedules

**Jamie Sabino** - 10:54:42 AM
will do working on it now

*Attachments:*
- messageReference

**Barry Evans** - 10:54:50 AM
i am saying that if i am a customer and I change a prompt and want that prompt to apply to everything i have already ingested, then I'm going to have to reprocess it

**Barry Evans** - 10:54:57 AM
or maybe i dont

**Barry Evans** - 10:55:11 AM
or maybe I do some of it

**Barry Evans** - 10:55:16 AM
or maybe I only do new stuff

**Barry Evans** - 10:55:28 AM
i dont see the issue here

**Jamie Sabino** - 10:55:58 AM
that's what i thought.. and we should look at how we want to handle that.. first in first out, reverse order so new assets are running first? or maybe i'm just over thinking it..

**Jamie Sabino** - 10:56:24 AM
that would probably be controlled outside of AIplus anyway.. but that's where i was at

**Barry Evans** - 10:56:35 AM
it would yes

**Barry Evans** - 10:56:51 AM
we're just chucking stuff over and saying "please do this"
*Reactions: 👍*

**Jamie Sabino** - 10:58:49 AM
ok Jez Tucker, queue is gone,  before i turn on notificationAPI (key service that checks the rabbit queue) , confirm you are ready. I don't see anything in the queue pixstor-fs-events-xchg_notification-api

**Jamie Sabino** - 10:59:17 AM
which i think is good, just not sure if there are some items mid process ,

**Jamie Sabino** - 11:00:03 AM
i'm watching the queue.. not sure what your cront/cycle is set at.. but it looks like its idle now..

**Jamie Sabino** - 11:01:48 AM
if you can provide the procedure to retrigger the full re-indexing, if we see something go wrong, i'll need to do it all over again.

**Jez Tucker** - 11:02:20 AM
We can look at that tomorrow. Running on borrowed time right now.

**Jez Tucker** - 11:10:21 AM
ok Jamie Sabino re-enabling the schedules in hub.  you will not get insta results, the snapdiffs have to be calculated first

**Jamie Sabino** - 11:11:11 AM
sounds good.

**Jez Tucker** - 11:11:43 AM
I can see notifications are heading to the Iris rabbit q

**Jez Tucker** - 11:12:20 AM
example: /mmfs1/data/space01/Footage/Dead_Pixels/A507C002_171118_R0O4.mov

**Jez Tucker** - 11:12:31 AM
Going to drop off now and see where we are in the am
*Reactions: 👍, 👍*

**Jason Perr** - 2:16:54 PM
Just to add some context here – the pain of this full re-ingest is directly related to our test hardware, which is a great preview of a budget-conscious customer. Our A6000 GPUs are 3-4x slower than the recommended Blackwell cards, which is why these jobs are taking so long.


 


This proves we need to architect for configurable reprocessing. A customer on high-end hardware might want a full rescan after a prompt change, while another on slower systems will need "additive" or "forward-only" options. For our own testing on these slow environments, we should probably keep full rescans to a minimum to save time.
*Reactions: 👍*


## 10/2/2025

**Jez Tucker** - 6:19:53 AM
Here's a quick and effective method






 


disable hub schedules
mmlssnapshot mmfs1 -Y | grep "schedule\-iris\-notify\-" | awk -F ':' '{ print "mmdelsnapshot mmfs1" " " $15 ":" $8}' > snaplist
sh snaplist
rm -f snaplist
rm -f /mmfs1/.rotate/ngenea-worker.lastsnap.schd.schedule-iris-notify*
rm -f /mmfs1/.rotate/snapdiff.schd.schedule-iris-notify*.lock
enable hub schedules

*Attachments:*
- messageReference
*Reactions: 👍*

**Gareth Tucker** - 9:17:52 AM
Jason Perr Jamie Sabino


 


As touched on in the call, the BIOS has been updated but it didn't make any difference to the reported LnkSta Speed unfortunately. The link speeds were set to auto before.


 


Testing outside of AI+ suggests that the default reported speeds may be a red herring, as the link speed does scale up when you load up the GPU as shown in the below video.


 


The guys mentioned that they did see similar when it was first installed late last year, and the solution was to change the power settings in the GUI app for the card. They mentioned that it looks like the OS has been re-installed since they last played with it and that the app is no longer installed. They have however made sure that the OS is in "performance" mode via the GUI.


 


I have just tried to run a quick test to see if things were any better following the changes and restart from an AI+ perspective but am getting "404: Media file not found" in MetaGen.


 






 


{"filename": "http_logger.py", "func_name": "dispatch", "lineno": 48, "event": "HTTP Request", "timestamp": "2025-10-02 16:05:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "126518560045344", "HttpMethod": "POST", "URL": "http://0.0.0.0:9003/process", "HttpHeaders": {"user-agent": "python-httpx/0.28.1", "x-correlation-id": "6ff3eb74-58d0-4d0b-9dce-ccdd49c279c2"}, "HttpRequestBody": {"job_id": "ca6715ef-85f1-499f-9c69-beba504d7c54", "media_file": "iris/space01/Gareth/Testing/Transcription Segments/Sriracha_30_2025100201.mp4", "processing_type": "Queue", "callback_url": "rabbitmq://", "config": {"model": "qwen3:14b", "transcriber": "parakeet", "scope": "combined", "prompts": [{"fieldName": "summary", "prompt": "Generate a summary not to exceed 500 characters which describes in detail the action taking place in this video. When describing the content, refer to the transcript provided as the video instead of saying the transcript", "type": "string"}, {"fieldName": "keywords", "type": "json", "prompt": "Generate a list a of 10 keywords which would be most applicable for referencing this content"}], "transcription": {"prompts": []}, "processing": {}, "preprocessing": {}, "augmentation": {"brightness": {}, "contrast": {}, "rotation": {}, "horizontal_flip": {}}}, "queue_metadata": {"fsInode": {"fsid": "3300357220954201602", "ino": "267636", "igen": "1117671439"}, "s3object": {"endpointUrl": "https://10.222.222.2:7070", "bucket": "space01", "key": "Gareth/Testing/Transcription Segments/Sriracha_30_2025100201.mp4", "etag": ":3300357220954201602:267636:1117671439"}}, "tenant_id": "iris"}, "log_level": "INFO", "log_channel": "aiplus.core.log.http"}
{"filename": "api.py", "func_name": "process", "lineno": 147, "event": "Failed to create processing job: 404: Media file not found: /app/media/iris/space01/Gareth/Testing/Transcription Segments/Sriracha_30_2025100201.mp4", "timestamp": "2025-10-02 16:05:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "126518560033696", "CorrelationId": "6ff3eb74-58d0-4d0b-9dce-ccdd49c279c2", "ExternalTransactionId": ":3300357220954201602:267636:1117671439", "log_level": "ERROR", "log_channel": "__main__"}
{"filename": "http_logger.py", "func_name": "dispatch", "lineno": 93, "event": "HTTP Response", "timestamp": "2025-10-02 16:05:14", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "126518560045344", "HttpStatusCode": 500, "HttpResponseBody": {"detail": "404: Media file not found: /app/media/iris/space01/Gareth/Testing/Transcription Segments/Sriracha_30_2025100201.mp4"}, "ProcessingTime": "0.001s", "log_level": "INFO", "log_channel": "aiplus.core.log.http"}
INFO:     127.0.0.1:33328 - "POST /process HTTP/1.1" 500 Internal Server Error



 


NFS looks to be mounted OK.


 


Also seeing these in the log too re: RabbiqMQ


 






 


Prepare to send ChannelFrame(payload=b'\x08\x00\x00\x00\x00\x00\x00\xce', should_close=False, drain_future=None)
Received frame <pamqp.heartbeat.Heartbeat object at 0x7312587aa860> in channel #0 weight=8 on <Connection: "amqps://x8dkh453g8BB:******@10.20.0.162:5671//?heartbeat=60&blocked_connection_timeout=300&connection_name=metagen-publisher-04787c0d" at 0x731165bc2160>



 


If you could take a closer look when you have a moment please that would be great. Thanks.

*Attachments:*
- messageReference
- Screen Recording 2025-10-02 163414.mp4

**Gareth Tucker** - 10:20:18 AM
Justin Toribio these were the 2 files that I seen with Faces and the Confidence display issue


 





 


The value supplied looks ok, so it may be a corner case with the display formatting when rounding would take the confidence displayed to 100%

**Gareth Tucker** - 10:20:32 AM
We'll take a look at that on our side
*Reactions: 👍*

**Jamie Sabino** - 10:28:53 AM
Gareth Tucker ack on Cardiff, we'll revist, and we are looking at the above, i need to figure out who's cron'ing jobs into rabbit, Jez Tucker Orlando Richards ? you guys know? I checked the crontab don't see the qa process that was provided to us that we run at FTL,

**Jamie Sabino** - 10:30:24 AM
Everyone as an fyi, we had to blow away the queue so we will have to re-run the full re-indexing again (we'll likely push that for the weekend).  But if there is testing going on, (which appears to be, and automation somewhere), that will all be broken now fyi

**Gareth Tucker** - 10:34:43 AM
cron & Rabbit on which Lab Jamie Sabino?


 


Same question for the re-index too, which lab?

*Attachments:*
- messageReference

**Jason Perr** - 10:35:06 AM
Alt Systems

**Gareth Tucker** - 10:35:43 AM
Ah, makes more sense, you are referring to repeated events then yeah?

**Jason Perr** - 10:36:37 AM
We keep seeing all of these events getting created over and over again for some reason:

**Gareth Tucker** - 10:37:13 AM
Yeah, Jez is looking into the event issue for us

**Gareth Tucker** - 10:38:02 AM
there is a failure occurring whilst processing space01, and the side effect of that looks like it re-sends the events again on the following run
*Reactions: 👍*

**Jamie Sabino** - 10:53:16 AM
We disabled metagen service for space01.  Thanks for letting us know, in the event you guys fix it, you will have to add the IRIS backet back in
*Reactions: 👍*

**Jason Perr** - 10:57:56 AM
We are trying to do testing at Alt. Currently waiting over 3.5 minutes for iris-notify workflow in hub to complete. Anyone know why this is taking so long? Is there anything else we may be missing here?

**Gareth Tucker** - 11:05:40 AM
I have disabled the space01 schedule, that looks to have helped
*Reactions: 👍*

**Gareth Tucker** - 11:05:57 AM


**Gareth Tucker** - 11:06:16 AM
10 second runtime now for space02
*Reactions: 👍*


## 10/3/2025

**Gareth Tucker** - 3:04:53 AM
Justin Toribio Jason Perr we have confirmed the issue with trying to display a confidence value that rounds to 100% in Vision.


 


Before we apply a fix, is there any desire to display Confidence in a more granular way? Screen space available is restricted in the default metadata panel width which is why we currently round to the nearest whole number. Would displaying the non-rounded value as a tooltip be beneficial?

*Attachments:*
- messageReference

**Jason Perr** - 7:21:13 AM
Whole numbers are fine. I don't know if a use case where people would care to get more specific

**Gareth Tucker** - 7:25:31 AM
Thanks Jason, adding the tooltip is easy but we can leave of if you think there is no benefit

**Barry Evans** - 8:58:47 AM
hey all quick question... I've got an MXF that hasn't been picked up for transcription, but has been picked up for summaries - any known limits there? just qualifying this out a bit more but thought I'd throw the question out prematurely

**Barry Evans** - 9:04:04 AM
starting to shift a bit to "transcripts aren't working at all"  (wycombe)

**Daniel Iwan** - 9:04:21 AM
with new version summary comes with transcription

**Barry Evans** - 9:04:44 AM
k - at the moment it's not landing in Iris

**Barry Evans** - 9:05:30 AM
summary landing, transcription not. just tried it on previously "known good" content

**Daniel Iwan** - 9:05:43 AM
is a sidecar in S3?

**Barry Evans** - 9:06:02 AM
will look one sec

**Barry Evans** - 9:08:05 AM
Daniel Iwan - looks like yes

**Daniel Iwan** - 9:09:39 AM
so this one should have transcription, if it only has summary then possibly generated by older version?

**Barry Evans** - 9:10:57 AM
dont know not sure if it makes a difference but here is the side car which looks to have both the summary and transcription:

**Barry Evans** - 9:11:18 AM
/mmfs1/data/vizhub/.metadata/ai-plus/summarize/nllewellyn/CNNi/CNN_Test_Files_2025/479_2839_01.mxf.metadata.json

**Barry Evans** - 9:11:34 AM
That was generated on Monday 30th Sept

**Barry Evans** - 9:12:15 AM


**Daniel Iwan** - 9:13:06 AM
that looks good, and yours ?

**Jamie Sabino** - 9:13:31 AM
Did Wycombe get updated yet ? (ie,  iris/vision/pixstore?) i'm assuming not as the team is still debugging ALT, right?

**Barry Evans** - 9:14:37 AM
dunno, dunno what's changed where just flagging - what was once, is no longer

**Barry Evans** - 9:15:01 AM
for now, pasta and bourbon
*Reactions: 😆*

**Gareth Tucker** - 9:17:10 AM
My guess is "segments", version of Vision on HW does not understand them yet
*Reactions: 👍*

**Gareth Tucker** - 9:18:02 AM
will double check

**Daniel Iwan** - 9:18:22 AM
depends if Nick L's can be displayed I guess
*Reactions: 👍*

**Gareth Tucker** - 9:26:26 AM
Yeah, looks to be the case. Will get sorted when it gets upgraded.

**Gareth Tucker** - 9:28:23 AM
No upgrades to HW yet Jamie no. Hub team is focussed on getting final build together at the moment which includes looking into what is going on at Alt on space01.

*Attachments:*
- messageReference

**Jamie Sabino** - 9:51:09 AM
Gareth Tucker Barry Evans we (Ankit Josh(IC) Arunita sahu(IC)are still going to proceed with AI+ OS / disk changes IST start of business hours Monday for Wycombe, please let us know if there's any issue with taking the service offline, as this is a high risk MW.
*Reactions: 👍*

**Gareth Tucker** - 9:56:06 AM
I believe that is still fine Jamie Sabino as the demos generally show static content rather than rely on live processing.
*Reactions: 👍*

**Barry Evans** - 12:26:10 PM
Yeah you’re good Jamie Sabino let’s get it done and dusted
*Reactions: 👍*


## 10/5/2025

**Jamie Sabino** - 7:58:18 PM
All, Wycombe AI+ server has been updated and back in service. Ankit Josh(IC) and Arunita sahu(IC) just an fyi, docker is running now on the new LV 



(base) root@hw-ngbox-gpu-02:/home/pixadmin/devOpsTools# df -h / /var/lib/docker

Filesystem                         Size  Used Avail Use% Mounted on

/dev/mapper/ubuntu--vg-ubuntu--lv  354G  326G   14G  97% /

/dev/mapper/ubuntu--vg-docker--lv  1.2T  135G  1.1T  11% /var/lib/docker
*Reactions: 👍, 👍, 👍, 👍*


## 10/6/2025

**Gareth Tucker** - 4:04:44 AM
FYI, the facial recognition confidence 100% rounding fix has been applied to Alt. We left the tooltip in if somebody does wish to see something more granular.

*Attachments:*
- messageReference
*Reactions: 👍*

**Gareth Tucker** - 5:25:07 AM
Everyone today's weekly integration call has been moved to Wednesday to give the Hub team some time to finish their bits. There will be no call today but if you had any questions scheduled for it, please drop them here. Thanks.

**Orlando Richards** - 6:29:21 AM
Thanks Gareth - how are things looking for a Vision build release today?

**Gareth Tucker** - 6:35:15 AM
will hand that one over to Daniel Iwan, the component update is built.

**Daniel Iwan** - 6:43:16 AM
I can build new version with a fix for the AI+ confidence display in the next few mins
*Reactions: 👍*

**Orlando Richards** - 6:51:53 AM
is the only diff from 1.5.3 the confidence display tweak?

**Daniel Iwan** - 6:53:14 AM
correct

**Daniel Iwan** - 6:53:56 AM
plus tweak in Vision






 


- Adjusted the font size of material-form-fields (input, select, menu) and updated the placeholder text-color for consistency

**Daniel Iwan** - 10:30:35 AM
Pixstore image has been downloaded and upgrade applied on dev-02.


Currently facing 42 errors similar to


 



 


ca-sn-dev-02.pixstor:
----------
          ID: mediatransformer postgres user
    Function: postgres_user.present
        Name: mediatransformer
      Result: False
     Comment: The following requisites were not found:
                                 require:
                                     id: wait for postgres
     Changes:   
----------
          ID: mediatransformer postgres database
    Function: postgres_database.present
        Name: mediatransformer
      Result: False
     Comment: One or more requisite failed: iris.install.mediatransformer postgres user
     Changes:   
----------
          ID: vision postgres user
    Function: postgres_user.present
        Name: vision
      Result: False
     Comment: The following requisites were not found:
                                 require:
                                     id: wait for postgres
     Changes:   
----------
          ID: visiondb postgres database
    Function: postgres_database.present
        Name: visiondb
      Result: False
     Comment: One or more requisite failed: iris.install.vision postgres user
     Changes:   
which suggest it does not recognise Vision was previously installed?

**Jez Tucker** - 10:38:21 AM
hmm. indeed.

**Jez Tucker** - 10:38:46 AM
let me have a quick look

**Jez Tucker** - 10:40:18 AM
ok. 


We will also need: 


pixstor-enablefeature iris
and pixstor apply after
*Reactions: 👍*

**Daniel Iwan** - 10:40:19 AM
I've just enabled keycloak and postgres roles on it, but that's about it

**Orlando Richards** - 10:42:09 AM
quite possibly you have out of date node roles - can you paste in cat /etc/pixstor/salt/pillar/site/gpfscluster.sls ? 


 


Looking, in particular, for the postgres and keycloak roles, as well as vision

**Daniel Iwan** - 10:44:21 AM
sure, enabling iris atm. but that failes. Here's the output


 



 


root@ca-sn-dev-02:~ # cat /etc/pixstor/salt/pillar/site/gpfscluster.sls
gpfscluster:
  nodes:
    ca-sn-dev-02.pixstor:
      cidr: 24
      ip: 10.222.222.2
      roles:
        acl-rest: true
        analytics: true
        analytics_elasticsearch: true
        analytics_kibana: true
        apcore-schedulers: true
        apmgmt-rest: true
        apsearch: true
        apsearch-ingest: true
        auth: true
        condor: true
        config-manager: true
        ctdb: true
        elasticsearch: true
        media: true
        metricsnode: true
        middleware: true
        nfs: false
        ngeneahub: true
        ngeneaworker: true
        pixdjango: true
        pixstornode: true
        samba: true
        ux-server: true
        ganesha: true
        vision: true
        versitygw: true
        opensearch: true
        keycloak: true
        postgres: true
  uuid: bfd9c8c4-3d68-11f0-9687-77e3c10c3d98
  filesystems:
    mmfs1:
      filesets:
        space01:
          path: /mmfs1/data/space01
          pool: sata1
          iris: true
          name: space01
        myspacetest:
          iris: true
          path: /mmfs1/data/myspacetest
          pool: sata1
          size: 1073741824
          name: myspacetest
        myspacestest2:
          iris: true
          path: /mmfs1/data/myspacestest2
          pool: sata1
          size: 1073741824
          name: myspacestest2
        curlspacestest1:
          iris: false
          path: /mmfs1/data/curlspacestest1
          pool: sata1
          size: 1073741824
          name: curlspacestest1
        curlspacestest2:
          iris: true
          path: /mmfs1/data/curlspacestest2
          pool: sata2
          size: 1073741824
          name: curlspacestest2
        ngeneabucketmanagerstoragetest-info:
          iris: true
          path: /mmfs1/data/ngeneabucketmanagerstoragetest-info
          pool: sata1
          size: 1073741824
          name: ngeneabucketmanagerstoragetest-info
        qa:
          iris: true
          path: /mmfs1/data/qa
          pool: sata1
          name: qa

**Daniel Iwan** - 10:44:29 AM
I've run

**Daniel Iwan** - 10:45:06 AM
pixstor config set gpfscluster:nodes:${NODENAME}:roles:keycloak true
pixstor config set gpfscluster:nodes:${NODENAME}:roles:postgres true

**Jez Tucker** - 10:45:48 AM
likely it is failing as the roles are mismatched.  might be better for us just to force in the vision  role to true as well at this point


 


the server_address is already set correctly






 


pixstor config get iris:vision:server_address
ca-sn-dev-02.om.cardifflab

**Jez Tucker** - 10:46:41 AM
pls hold a mo

**Daniel Iwan** - 10:50:04 AM
no problem, btw don't feel pressure to fix it today Jez Tucker we may reconvene tomorrow
*Reactions: 👍*

**Jez Tucker** - 10:50:48 AM
The tea time bell has just gone.


I have set off a pixstor_apply after setting the roles to a 'new node rollout' and will look again after.
*Reactions: 👍*

**Daniel Iwan** - 10:51:25 AM
great, thanks Jez

**Jez Tucker** - 11:22:18 AM
famous last words of won't nee manual intervention; hub migrations. this system was older than I thought in setup.


 


looking at it deeper, the takeaway is really, it's no longer representative of a deployed system it's had lots of fiddling. sure we can make it work, but it's not the same.
*Reactions: 👍, 👍*

**Gareth Tucker** - 11:24:21 AM
Lets work out how best to attack in the morning, sounds like a wipe and re-install may be on the cards though.

**Jez Tucker** - 11:30:00 AM
yep indeed. while I can see the migration issue, devs can be more precise than the big hammer we'd want to use right now
*Reactions: 👍*

**Jez Tucker** - 11:30:30 AM
useful info for tomorrow






 


root@ca-sn-dev-02:/etc/sysconfig # yum history ngenea-hub
ID     | Command line                                                                                          | Date and time    | Action(s)      | Altered
------------------------------------------------------------------------------------------------------------------------------------------------------------
   103 | -y localinstall ./ngenea-hub-2.9.0-0.alpha.2.arcapix.x86_64.rpm                                       | 2025-09-16 14:43 | Upgrade        |    1   
   102 | downgrade ngenea-hub-2.7.0-0.dev.21799+ea47adc6.arcapix                                               | 2025-09-16 14:40 | Downgrade      |    1   
   101 | upgrade ngenea-hub-2.9.0-0.dev.21937+8d9fa63e.arcapix.x86_64                                          | 2025-09-16 14:14 | Upgrade        |    1   
   100 | downgrade ngenea-hub-2.6.0-0.dev.20354+a48267ea.arcapix.x86_64 -y                                     | 2025-09-16 14:10 | Downgrade      |    1  <
    96 | -y --disablerepo=* localinstall ./ngenea-hub-2.7.0-0.dev.21799+ea47adc6.arcapix.x86_64.rpm ./ngenea-h | 2025-09-01 13:53 | D, I           |    5 ><
    76 | -y --best --allowerasing install ngenea-hub-2.6.0-1.arcapix ngenea-hub-client-2.6.0-1.arcapix ngenea- | 2025-05-01 13:28 | Install        |    5 >


## 10/7/2025

**Jez Tucker** - 2:13:21 AM
cardiff-02 is backup and running and the salt is clean [irrespective of any decisions on wipes]
*Reactions: ❤️*

**Daniel Iwan** - 2:14:47 AM
that's great, thanks Jez. Is there anything else you think may be worth doing from your side?

**Jez Tucker** - 2:15:05 AM
well, I'll have a look at the hub configs for 2 mins

**Jez Tucker** - 2:15:21 AM
really, we need to get this .rc1 out so we can do the final integration test

**Jez Tucker** - 2:16:02 AM
2 tickets in dev to go

**Jez Tucker** - 2:16:51 AM
though I would say Orlando Richards the salt keeps wanting to apply






 


ca-sn-dev-02.pixstor:
----------
          ID: vision-component@mcs-media-transformer-engine.service
    Function: service.running
      Result: True
     Comment: Service vision-component@mcs-media-transformer-engine.service is already enabled, and is running
     Changes:   
              ----------
              vision-component@mcs-media-transformer-engine.service:
                  True

Summary for ca-sn-dev-02.pixstor
---------------
Succeeded: 1031 (changed=1)
Failed:       0
---------------
Total states run:     1031
 



could be something I have not done

**Orlando Richards** - 2:30:19 AM
my guess is the service is crashing - check its logs

**Jez Tucker** - 2:31:17 AM
kk. also checking over logins and suchlike before handback

**Jez Tucker** - 2:39:51 AM
indeed. 


 



 


root@ca-sn-dev-02:/opt/arcapix/salt/states/ngeneahub/files/nginx/conf.d/nghub # journalctl -fu vision-component@mcs-media-transformer-engine.service
-- Logs begin at Mon 2025-10-06 04:42:10 BST. --
Oct 07 10:38:55 ca-sn-dev-02 systemd[1]: Stopped Vision component service launcher.
Oct 07 10:38:55 ca-sn-dev-02 systemd[1]: Starting Vision component service launcher...
Oct 07 10:38:55 ca-sn-dev-02 systemd[1]: Started Vision component service launcher.
Oct 07 10:38:55 ca-sn-dev-02 docker[3241775]:  imagemagick Pulling
Oct 07 10:38:55 ca-sn-dev-02 docker[3241775]:  nscd Pulling
Oct 07 10:38:56 ca-sn-dev-02 docker[3241775]:  imagemagick Error
Oct 07 10:38:56 ca-sn-dev-02 docker[3241775]:  nscd Error
Oct 07 10:38:56 ca-sn-dev-02 docker[3241775]: Error response from daemon: pull access denied for 832471001844.dkr.ecr.us-east-1.amazonaws.com/vision/mcs-imagemagick-api, repository does not exist or may require 'docker login': denied: Your authorization token has expired. Reauthenticate and try again.
Oct 07 10:38:56 ca-sn-dev-02 systemd[1]: vision-component@mcs-media-transformer-engine.service: Main process exited, code=exited, status=18/n/a
Oct 07 10:38:56 ca-sn-dev-02 systemd[1]: vision-component@mcs-media-transformer-engine.service: Failed with result 'exit-code
 


Gareth Tucker  one for you

**Daniel Iwan** - 2:42:18 AM
registry is set to AWS

**Daniel Iwan** - 2:43:17 AM
I've changed environment.properties now

**Jez Tucker** - 2:43:44 AM
thx. seeing if we can get to a clean salt state
*Reactions: 👍*

**Jez Tucker** - 2:45:00 AM
clean salt. now just the logins

**Daniel Iwan** - 2:45:49 AM
this instance may be off one way or another when it comes to vision component versions, we will sort it out and align where needed

**Gareth Tucker** - 2:46:02 AM

**Daniel Iwan** - 2:49:42 AM
Thanks, I will stop our services and start working on switchover

*Attachments:*
- messageReference

**Jez Tucker** - 2:49:58 AM
ok. so I logged pixadmin into hub (hub only login) and then logged out and logged into keycloak as pixadmin, login worked

**Jez Tucker** - 2:50:22 AM
when I click through to iris, I get the white screen which from alt lab learnings was SSL cert / CA related

**Jez Tucker** - 2:51:26 AM
though in this instance we are using fqdn 


pixstor config get iris:vision:server_address  is set to ca-sn-dev-02.om.cardifflab


the url in the browser is https://ca-sn-dev-02.om.cardifflab/iris/


 


I will have a look at the cert and CA

**Daniel Iwan** - 2:51:53 AM
vision logs in for me, but the problem with short space name is back

**Jez Tucker** - 2:52:19 AM
we have not yet provided a version whcih fixes the short space name, so I will downgrade the software for most of today

**Daniel Iwan** - 2:52:25 AM
is it possible / straightforward to rename a Space?

**Jez Tucker** - 2:52:31 AM
hopefully it will arrive later afternoon

**Jez Tucker** - 2:52:48 AM
not simple, no.  a lot easier to downgrade the versitygw software
*Reactions: 👍*

**Jez Tucker** - 2:54:02 AM
done and both services restarted ok

**Jez Tucker** - 2:55:02 AM
odd, I can't even access iris/ when I go via IP instead of fqdn

**Jez Tucker** - 2:55:35 AM
Daniel Iwan did you need to accept the CA this time?

**Daniel Iwan** - 2:57:10 AM
oh, that is still on 9505

**Daniel Iwan** - 2:58:49 AM
https://ca-sn-dev-02.om.cardifflab/iris/


shows me whitepage


I will start looking into it because our components and configs needs updating now


thanks Jez

**Jez Tucker** - 2:59:10 AM
okie

**Daniel Iwan** - 3:30:18 AM
Orlando Richards would the postgres passwords and dbs be automatically created after apply?


would the creds be under






 


salt-call pixpillar.get_obfuscated postgres:

**Orlando Richards** - 3:42:31 AM
yeah, they should be made automatically (along with the database)


You can get the postgres superuser password with:


 



 


salt-call pixpillar.get_obfuscated postgres:patroni:service_accounts:builtin_superuser:password
 


For the application passwords:


 



 


visiondb database: 
  username: vision
  password: salt-call pixpillar.get_obfuscated iris:visiondb:password
mediatransformer database:
  username: mediatransformer
  password: salt-call pixpillar.get_obfuscated iris:mediatransformerdb:password

opensearch:
  username: iris-vision
  password: salt-call pixpillar.get_obfuscated iris:opensearch:password

**Daniel Iwan** - 3:43:18 AM
oh it's iris: I was looking in the wrong place, thanks

*Attachments:*
- messageReference

**Orlando Richards** - 3:43:29 AM
#brandingfun

**Jez Tucker** - 4:16:27 AM
can you dm me the changes?  this occurs on all our dev nodes with iris deployed atm

*Attachments:*
- messageReference

**Orlando Richards** - 4:26:10 AM
what's that Jez Tucker?

**Orlando Richards** - 4:26:26 AM
is there a problem with the iris deployment?

**Daniel Iwan** - 4:28:58 AM
Jez Tucker I dm'ed you but there should be no need to adjust that. In our case we have changed registry URL at some point to pull latest Vision containers

**Orlando Richards** - 4:58:13 AM
Daniel Iwan - we've replaced the pixitmedia theme setting in the iris keycloak realm with the iris theme - can you remove setting the realm theme from the installer?

**Orlando Richards** - 4:58:29 AM
(not a blocker for GA)

**Orlando Richards** - 4:58:47 AM


**Daniel Iwan** - 5:01:44 AM
sure

**Jez Tucker** - 5:26:19 AM
we have the updated versity version with the bucket name patch


any takers for a test upgrade ?
*Reactions: 👍*

**Daniel Iwan** - 5:30:26 AM
please apply on dev-02

**Jez Tucker** - 5:48:23 AM
ok. that space name length should now be valid at >= 1

**Daniel Iwan** - 5:49:38 AM
great, thanks

**Daniel Iwan** - 6:28:52 AM
all good on this

*Attachments:*
- messageReference

**Jez Tucker** - 6:29:23 AM
thanks. it's already in pixstor 6.11.0-0.beta.1

**Gareth Tucker** - 11:12:56 AM
Jamie Sabino did anybody get a chance to look into "404: Media file not found" on the Cardiff AI+ server for us afterwards?


 



 


{"filename": "api.py", "func_name": "process", "lineno": 147, "event": "Failed to create processing job: 404: Media file not found: /app/media/iris/space01/Gareth/Testing/1.5.4/Sriracha_30_2025100701.mp4", "timestamp": "2025-10-07 18:07:11", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "126518560031408", "CorrelationId": "10ef8ab9-e37b-4cba-a6b7-c54cdf107ae6", "ExternalTransactionId": ":3300357220954201602:287243:367576840", "log_level": "ERROR", "log_channel": "__main__"}
{"filename": "http_logger.py", "func_name": "dispatch", "lineno": 93, "event": "HTTP Response", "timestamp": "2025-10-07 18:07:11", "ComponentName": "MetaGen", "ThreadName": "MainThread", "TaskId": "126518560046800", "HttpStatusCode": 500, "HttpResponseBody": {"detail": "404: Media file not found: /app/media/iris/space01/Gareth/Testing/1.5.4/Sriracha_30_2025100701.mp4"}, "ProcessingTime": "0.001s", "log_level": "INFO", "log_channel": "aiplus.core.log.http"}
INFO:     127.0.0.1:60282 - "POST /process HTTP/1.1" 500 Internal Server Error
 


Looks like we are still getting that error for new files and we also still see these RabbitMQ Heartbeat errors in the MetaGen logs.


 



 


Prepare to send ChannelFrame(payload=b'\x08\x00\x00\x00\x00\x00\x00\xce', should_close=False, drain_future=None)
Received frame <pamqp.heartbeat.Heartbeat object at 0x731165e56c80> in channel #0 weight=8 on <Connection: "amqps://x8dkh453g8BB:******@10.20.0.162:5671//?heartbeat=60&blocked_connection_timeout=300&connection_name=metagen-publisher-04787c0d" at 0x731321df6250>

*Attachments:*
- messageReference

**Gareth Tucker** - 11:14:00 AM
FYI, there is no sign of any RabbitMQ issues in the Notification API logs

**Jason Perr** - 11:18:07 AM
Everyone We really need to get access to the activity monitor to be able to show progress of AI services running. Is there anything we can do on our side to help move this forward? Or can someone please create a ticket where needed?

**Gareth Tucker** - 11:24:28 AM
We'll add a ticket Jason Perr and I will include it for review as part of IP8. The Activity Monitor is currently aimed at monitoring user triggered tasks at the moment, not automated background tasks.

**Gareth Tucker** - 11:46:36 AM
Jason Perr is visual progress necessary, or would seeing the current processing status for an asset in the metadata panel meet the requirement here?

**Jason Perr** - 11:51:09 AM
Current processing status would be fine.

**Gareth Tucker** - 11:54:28 AM
Cool. And we could get the AI+ utilities to push that progress back to Vision via API if desired?

**Jamie Sabino** - 12:01:50 PM
Gareth Tucker we have a JIRA for the rabbitmq issue, https://perifery.atlassian.net/browse/AI-1182, this is a result of the current gpu and pci issue (yet to be fully resolved), as for the 404, let me dive into that, typically this means the mount got messed up (has happened several times)
*Reactions: 👍, 👍*

**Jason Perr** - 12:13:57 PM
Gareth Tucker I have some Vision bug tickets based on our testing today. Where should I generate those? Which project would be best for you?

**Justin Toribio** - 12:15:11 PM
Gareth Tucker Yep, we currently already do that with other MAM integrations (i.e. Iconik).  Just need the details of the API (i.e. expected payload and format etc...)

*Attachments:*
- messageReference
*Reactions: 👍*

**Gareth Tucker** - 12:20:44 PM
MCS please Jason, assign to me


 


https://perifery.atlassian.net/jira/software/c/projects/MCS/summary

*Attachments:*
- messageReference

**Jamie Sabino** - 1:10:45 PM
Gareth Tucker i don't see /app/media/iris/space01/Gareth/Testing/1.5.4/Sriracha_30_2025100701.mp4 in vision dev-01, (i can't view / see the "testing" folder), i went to check dev02 instance thinking it might be there, but it appears down https://ca-sn-dev-02.om.cardifflab:9505/ giving a 404, dev-01 is currently active and i ran a test, no "file not found" error.

**Gareth Tucker** - 1:19:39 PM
Jamie Sabino AI+ is still running against Dev 02, however Dev 02 got it's upgrade today to allow all services to run under port 443 like Alt, so you need a small change in URL


 


Direct link to the folder below


 


https://ca-sn-dev-02.om.cardifflab/iris/object-listing/space01/Gareth%2FTesting%2F1.5.4%2F

**Gareth Tucker** - 1:21:54 PM
Default Vision URL for Dev 02 is now


 


https://ca-sn-dev-02.om.cardifflab/iris
*Reactions: 👍*

**Jamie Sabino** - 2:05:24 PM
Gareth Tucker the 404 issue is now gone,  looking at some gpu setting changes  based on the earlier thread here as well, (as for root cause, i see Triton collapsed, 6 days ago, could be related, but not going to try and reproduce given the state of this server at the moment).
*Reactions: 👍*

**Gareth Tucker** - 2:46:30 PM
Happy to take a restart and perform restricted testing if that is possible to help get some Jira's signed off

**Jamie Sabino** - 3:17:54 PM
so, Gareth Tucker at an attempt to try and tune/tweak the gpu,  might have made things worse, i'll need someone onsite.. , i put most the notes in https://perifery.atlassian.net/browse/AI-1176, but high level in the Kernel logs, we are getting a GPU-Specific PCIe Negotiation Failure,


 



# Network cards: PCIe 3.0 (8.0 GT/s) - NORMALixgbe 0000:03:00.0: 31.504 Gb/s available PCIe bandwidth (8.0 GT/s PCIe x4 link)ixgbe 0000:03:00.1: 31.504 Gb/s available PCIe bandwidth (8.0 GT/s PCIe x4 link)# Other devices: PCIe 3.0 (8.0 GT/s) - NORMAL  7.876 Gb/s available PCIe bandwidth, limited by 8.0 GT/s PCIe x1 link



GPU Missing from Bandwidth Reports:



No bandwidth reporting for GPU (01:00.0)Indicates GPU slot has specific negotiation failure
Going to need someone to dive into the BIOS, and check a couple things, primarily PCIe slot speed settings, or even try another slot etc if possible.. Ankit Josh(IC) and Arunita sahu(IC) heads up here, when the UK team come online tomorrow, notes in AI-1176 .


 


Sidebar and moving forward, Gareth Tucker i think it might be best to test your changes in FTL for functionality and qa, i / we don't see this gpu / hardware being supported, what can i do to help shift over to FTL? we have two vision instances there we could do the same as you are doing in Cardiff (and Cardiff vpn seems to be very very slow).. so this might help.
*Reactions: 👍, 👍, 👍*

**Jamie Sabino** - 3:18:33 PM
Jason Perr ^ just an fyi.. on the "red herring"


## 10/8/2025

**Gareth Tucker** - 2:34:54 AM
Thanks for the feedback Jamie, we'll get somebody from the Ops team to review further today.

*Attachments:*
- messageReference

**Jez Tucker** - 3:15:02 AM
Everyone I am rebooting the cardiff-02 node to upgrade it


Will notify when done

**Jez Tucker** - 4:02:49 AM
Everyone back up. salt is clean.  have logged into hub and iris ok.  not punched any buttons outside of that.  versity is on the space minchars=1 version
*Reactions: 👍, 👍*

**Jez Tucker** - 4:05:21 AM
note there is a landing page at the root of https://ca-sn-dev-02.om.cardifflab/  unsure if anyone has seen that yet
*Reactions: 👍*

**Gareth Tucker** - 5:14:33 AM
Everyone FYI, today's integration call has been cancelled as there has been a problem creating the build that we were due to test today.



If a meeting is required, we will arrange another ad-hoc.


 


If there are any questions on the meantime, please drop them here. Thanks.

**Daniel Iwan** - 5:15:26 AM
Migrate / Recall issue already covered I guess?

*Attachments:*
- messageReference

**Gareth Tucker** - 5:20:25 AM
Reviewing with Jez

*Attachments:*
- messageReference

**Jez Tucker** - 6:25:01 AM
try now, I have reverted the workflow names back in the salt pillar, run the state. the mcs-vision-api service has been restarted

**Jez Tucker** - 6:25:15 AM
let me know then I'll go change it in the pixstor code
*Reactions: 👍*

**Gareth Tucker** - 6:25:31 AM
Thanks Jez Tucker

**Gareth Tucker** - 6:29:07 AM
Quick run through from my side looks like migrate and recall is back working as expected.
*Reactions: 👍*

**Jez Tucker** - 6:46:21 AM
super. will make that change
*Reactions: 👍*

**Gareth Tucker** - 10:15:41 AM
Jamie Sabino FYI, Mike from our Ops team has added some comments to your Jira based on findings today with the Cardiff AI+ server based on your suggestions.


 


https://perifery.atlassian.net/browse/AI-1176


 


Could you please take a review and let us know your thoughts for next steps. If a collaborative session with remote hands would be beneficial we can also arrange that. If useful, please let me know some times that would suit you and we'll get that sorted. Thanks.


## 10/9/2025

**Gareth Tucker** - 1:11:38 AM
Everyone quick FYI for anybody that may need access to the Dev instances at the Cardiff Office this morning. There has been a water leak at Capital Tower and the VPN and server room is currently offline. Our Ops team are on site investigating and I will keep you posted. Thanks.

**Jez Tucker** - 1:31:23 AM
let us know if you suddenly need a cloud pixstor

**Jez Tucker** - 1:31:45 AM
"cloud": a non-wet pixstor
*Reactions: 😆*

**Daniel Iwan** - 1:32:21 AM
how ironic

*Attachments:*
- messageReference

**Jason Perr** - 11:55:11 PM
Everyone My server is up and running with Ubuntu 22 and NVIDIA Blackwell 96GB Card. Hoping to get Pixstor and Vision installed. Please let me know anything needed to assist. We will perform AI+ install tomorrow or Monday.  https://perifery.atlassian.net/wiki/spaces/IRIS/pages/4509499421/Jason+Office+Environment

**Ankit Josh(IC)** - 11:55:53 PM


## 10/10/2025

**Gareth Tucker** - 7:45:53 AM
Everyone The High Wycombe upgrade is now pencilled for Monday with the aim to complete final integration testing there.


 


Jason Perr hopefully we can pencil your install in after High Wycombe is sorted.

**Jez Tucker** - 7:49:09 AM
On that .. Jason is your install a VM?  I saw the specs that the OS is running Ubuntu.  Pixstor installs on RHEL.  Is there another node (what's the overall picture here..?)

**Jason Perr** - 8:05:41 AM
The install isn’t a VM — it’s currently running directly on Ubuntu 22 desktop. My thought was that we could spin up a RHEL VM on this system for the PixStor components if that’s the preferred setup. Would that work?

**Jason Perr** - 8:41:39 AM
Jez Tucker Where can I find the specs of the VM needed for Pixstor?

**Jason Perr** - 10:48:03 AM
Everyone what version of RHEL should we use?

**Gareth Tucker** - 11:22:41 AM
it's 8 I believe Jason

**Jason Perr** - 2:02:52 PM
Thanks


## 10/11/2025

**Jez Tucker** - 4:20:34 AM
pixstor is its own OS, based on RHEL.  You don't install RHEL then install pixstor.  It wipes what is there. 


VM wise, if we take a developer node, rather than a customer node (which would be a lot higher spec) probably an absolute minimum is 32 GB RAM, 8 cores and a 200GB disk to partition up.  I am not 100% sure we can commit to this specific roll out, will need to check with the powers.


## 10/13/2025

**Gareth Tucker** - 4:14:01 AM
Hi All, FYI, today's integration call has been moved to tomorrow at the same time whilst we aim to upgrade High Wycombe today. Please keep an eye on this chat for updates regarding High Wycombe as we may need some help to make sure all is good following the upgrade. Jez will be performing the upgrade and will update with news in due course.


 


We will determine whether we need tomorrow's call or not dependent on the outcome of the High Wycombe upgrade.


 


Any questions in the meantime, please drop them here. Thanks.


## 10/14/2025

**Jez Tucker** - 5:40:13 AM
Hello. 


Here's my list of pure integrations which we have not formally stepped through since hub alpha.2


 


Hub



distribute iris tasks to iris queues (bug: HUB2-3238, in development) 

  presently tasks are sent to the default queue in 2.9.0.rc.1

  root cause: long standing bugvison migrate and recall workflow (now defaulted back to migrate and recall)hsm status of file notify eventsenable iris on filesystem spacecentralised keycloaklarge scale ingest without salt api overloadupdate branding on keycloak password page
 


versitygw - 1.0.18-1 release  (since -11 release)



multipart uploadsfolder continuation issuebucket / space name >= 1 char

**Daniel Iwan** - 5:43:58 AM
Jez Tucker we have currently space  issue on dev-02 which opensearch moans about


I've freed up space by deleting previous image and pruning docker images.


Restart of opensearch still shows "No space left on device"


 



 


root@ca-sn-dev-02:~ # df -h | grep -Ev '(overlay2)'
Filesystem                                 Size  Used Avail Use% Mounted on
devtmpfs                                    16G     0   16G   0% /dev
tmpfs                                       16G  372K   16G   1% /dev/shm
tmpfs                                       16G   51M   16G   1% /run
tmpfs                                       16G     0   16G   0% /sys/fs/cgroup
/dev/sda1                                   20G  9.0G  9.6G  49% /run/initramfs/isoscan
/dev/loop0                                 4.5G  4.5G     0 100% /run/initramfs/live
/dev/mapper/pixstor-overlays               9.8G  1.2G  8.1G  13% /run/initramfs/overlayfs
/dev/loop1                                 4.4G  4.4G     0 100% /run/rootfsbase
LiveOS_rootfs                              9.8G  1.2G  8.1G  13% /
/dev/mapper/pixstor-etc--6.11.0--0.beta.1  974M   54M  854M   6% /etc
/dev/mapper/pixstor-home                   974M   44K  907M   1% /home
/dev/mapper/pixstor-var--6.11.0--0.beta.1   40G   26G   13G  68% /var
/dev/mapper/pixstor-var_home               4.9G  1.4G  3.3G  31% /var/home
/dev/mapper/pixstor-var_log                9.8G  2.4G  7.0G  26% /var/log
mmfs1                                      120G   61G   60G  51% /mmfs1
tmpfs                                      3.2G     0  3.2G   0% /run/user/0

**Jez Tucker** - 5:44:22 AM
luckily we're doing this on the HW cluster
*Reactions: 👍*

**Daniel Iwan** - 5:44:30 AM
I found this however






 


root@ca-sn-dev-02:~ # mmhealth node show

Node name:      ca-sn-dev-02.pixstor
Node status:    TIPS
Status Change:  3 days ago

Component        Status        Status Change     Reasons & Notices
--------------------------------------------------------------------------------------------------------------------------------------------
GPFS             TIPS          3 days ago        callhome_not_enabled, gpfs_deadlock_detection_disabled, gpfs_pagepool_small_4g
NETWORK          HEALTHY       3 days ago        -
FILESYSTEM       FAILED        21 hours ago      no_disk_space_warn(mmfs1)
DISK             HEALTHY       3 days ago        -
FILEAUDITLOG     HEALTHY       1 day ago         -
FILESYSMGR       HEALTHY       3 days ago        -

**Jez Tucker** - 5:44:32 AM
but yes, indeed

**Jez Tucker** - 5:45:23 AM
root@ca-sn-dev-02:~ # mmlspool mmfs1
Storage pools in file system at '/mmfs1':
Name                    Id   BlkSize Data Meta Total Data in (KB)   Free Data in (KB)   Total Meta in (KB)    Free Meta in (KB)
system                   0    512 KB   no  yes              0              0 (  0%)       10485760        7339520 ( 70%)
sata1                65537      8 MB  yes   no       62914560              0 (  0%)              0              0 (  0%)
sata2                65538      8 MB  yes   no       62914560       62750720 (100%)              0              0 (  0%)

**Jez Tucker** - 5:45:35 AM
no reason for 2x pools here, I think we merge them

**Daniel Iwan** - 5:46:37 AM
ok, something to do post integration maybe?

*Attachments:*
- messageReference

**Jez Tucker** - 5:46:45 AM
yep
*Reactions: 👍*

**Gareth Tucker** - 5:48:25 AM
Vision topics for integration



Add support for MetaGen v2 transcription segmentsAdd support for Iris base URLKeycloak v26 Fixes

Fix Vision in multiple tabsFix "Open in Hub"Remove session inactivity timeout

**Jez Tucker** - 5:54:21 AM
Daniel Iwan now you have space


 



 


Storage pools in file system at '/mmfs1':
Name                    Id   BlkSize Data Meta Total Data in (KB)   Free Data in (KB)   Total Meta in (KB)    Free Meta in (KB)
system                   0    512 KB   no  yes              0              0 (  0%)       10485760        7341568 ( 70%)
sata1                65537      8 MB  yes   no      125829120       62464000 ( 50%)              0              0 (  0%)
 


ideally needs a restripe, but over time gpfs will self balance and since we are not doing performance here, probably good

**Daniel Iwan** - 5:56:23 AM
perfect, thank you!

**Jez Tucker** - 5:57:04 AM
i can just leave it rebalancing while we do the integ call, might do that.  it's interruptable

**Daniel Iwan** - 6:00:16 AM
sure, why not

**Unknown User** - 6:00:40 AM


**Unknown User** - 6:00:49 AM


**Daniel Iwan** - 6:39:10 AM
{"eventTime": "2025-10-13T17:29:18.888Z", "eventName": "FileCreated", "tenantId": "iris", "source": {"fsInode": {"fsid": "6418838248910513162", "ino": "134742019", "igen": "65537"}, "s3object": {"endpointUrl": "https://10.100.0.1:7070", "bucket": "vizhub", "key": "./", "etag": ":6418838248910513162:134742019:65537"}, "hsm": {"offline": false}}}
{"eventTime": "2025-10-13T17:43:53.026Z", "eventName": "FileCreated", "tenantId": "iris", "source": {"fsInode": {"fsid": "6418838248910513162", "ino": "1572867", "igen": "65537"}, "s3object": {"endpointUrl": "https://10.100.0.1:7070", "bucket": "space01", "key": "./", "etag": ":6418838248910513162:1572867:65537"}, "hsm": {"offline": false}}}
{"eventTime": "2025-10-13T17:48:29.650Z", "eventName": "FileCreated", "tenantId": "iris", "source": {"fsInode": {"fsid": "6418838248910513162", "ino": "1572867", "igen": "65537"}, "s3object": {"endpointUrl": "https://10.100.0.1:7070", "bucket": "space01", "key": "./", "etag": ":6418838248910513162:1572867:65537"}, "hsm": {"offline": false}}}

**Daniel Iwan** - 6:46:40 AM
etag 


:6418838248910513162:1572867:65537

**Unknown User** - 6:55:04 AM


**Unknown User** - 6:55:05 AM


**Unknown User** - 7:01:32 AM


**Jez Tucker** - 9:38:36 AM
Fyi, new install from scratch with vision deployment shows


 



 


Setting up RabbitMQ
Starting services from Docker Compose file /var/lib/pixstor/iris/mcs-runtime/mcs-core/rabbitmq/compose.yml
rabbitmq Pulling
rabbitmq Pulled
Volume "mcs-core_rabbitmq-data"  Creating
Volume "mcs-core_rabbitmq-data"  Created
Container mcs-core-rabbitmq-1  Creating
Container mcs-core-rabbitmq-1  Created
Container mcs-core-rabbitmq-1  Starting
Container mcs-core-rabbitmq-1  Started
ERROR: (function __exitHandler()) Exiting script after error 1 in caller: 1 ./rabbitmq/install.sh
Stopping services with Docker Compose using file /var/lib/pixstor/iris/mcs-runtime/mcs-core/rabbitmq/compose.yml
Stopping services from Docker Compose file /var/lib/pixstor/iris/mcs-runtime/mcs-core/rabbitmq/compose.yml
Container mcs-core-rabbitmq-1  Stopping
Container mcs-core-rabbitmq-1  Stopped
Container mcs-core-rabbitmq-1  Removing
Container mcs-core-rabbitmq-1  Removed
ERROR: (function __exitHandler()) Exiting script after error 1 in caller: 1 ./mcs-core/install.sh
ERROR: (function __exitHandler()) Exiting script after error 1 in caller: 1 /usr/share/mcs-setup/scripts/mcs-setup.sh

**Jez Tucker** - 9:39:07 AM
is there a more granular install log dump / debug ?

**Jez Tucker** - 9:39:34 AM
docker compose -f /var/lib/pixstor/iris/mcs-runtime/mcs-core/rabbitmq/compose.yml  should work, right?

**Daniel Iwan** - 9:41:28 AM
yes, you can 






 


export DEBUG=true DEBUG_SHELL=true

**Jez Tucker** - 9:43:33 AM
have captured that log file to: /root/vision_install.log_rabbitmq_failure

**Jez Tucker** - 9:43:39 AM
on cardiff-01

**Daniel Iwan** - 9:44:10 AM
I will take a look

**Jez Tucker** - 9:45:22 AM
ah I know what it will be

**Jez Tucker** - 9:45:37 AM
root@ca-sn-dev-01:/etc/ngenea # df -hl /var

Filesystem                               Size  Used Avail Use% Mounted on

/dev/mapper/pixstor-var--6.11.0--0.rc.1   20G   19G     0 100% /var

**Jez Tucker** - 9:45:39 AM
betcha

**Daniel Iwan** - 9:47:03 AM
yes, may be a problem

**Jez Tucker** - 10:04:28 AM
yep. all good now.   taken a copy of the vision_install.log to /root/vision_install.log_ok
*Reactions: 👍*

**Daniel Iwan** - 10:05:25 AM
well spotted. Output looks good

**Jez Tucker** - 10:06:21 AM
I'm going to leave it there for this eve and give it a quick once over in the morning before handing it back (we also want to do the enable the file system for iris test too)

**Daniel Iwan** - 10:09:54 AM
sure, I've noticed versity has empty this. Maybe one for tomorrow


 



 


ls -la /var/lib/pixstor/versity/iris_root/
total 8
drwxr-xr-x 2 root root 4096 Oct 14 17:26 .
drwxr-xr-x 3 root root 4096 Oct 14 17:26 ..

**Jez Tucker** - 10:10:05 AM
no spaces are made yet

**Daniel Iwan** - 10:10:21 AM
ah, cool

**Gareth Tucker** - 10:11:17 AM
Thanks Jez, have a good one

*Attachments:*
- messageReference


## 10/15/2025

**Jez Tucker** - 2:59:58 AM
Morning. Rolling out a few additions to cardiff-01, such as the fake versity s3 bucket for migrate/recalls.  


My hunch having seen the 504 is its more of a cache warm up issue or some external lookup such as gethostbyname() not returning quickly.  Underlying cause not obvious.  I have enabled debug mode on cardiff-01 and will leave versity in that until it is reproduced.


Would be good to do this on -02 as well later if poss.

**Gareth Tucker** - 3:05:38 AM
Cool, you can enable debug on cardiff-02 when suits you Jez.


 


Let us know when cardiff-01 is ready to play with please.

**Jez Tucker** - 3:15:31 AM
cardiff-02 is now in debug mode

**Jez Tucker** - 3:16:10 AM
the relevant logs will be in journalctl -u versitygw@iris.service

**Daniel Iwan** - 3:38:24 AM
I have not seen 504 on dev02 but definitely slow listing in the root of the space(es).


7 secs for space01 to build a response body.

**Daniel Iwan** - 3:41:33 AM
just reproduced it, listing took 10.06 secs so 10 seconds may be a cut off for 504 to occur.


Slowness happens too regularly to be a caching issue, also happens in root only as far as I can tell so does not feel like a host lookup

**Daniel Iwan** - 5:24:19 AM
not sure if that is related but in space01 in root we have some date with StorageClass PREMIGRATED 


Also most of the objects are 


 



 


    <ChecksumAlgorithm></ChecksumAlgorithm>
    <ChecksumType></ChecksumType>
but some are


 



 


<ChecksumAlgorithm>CRC32</ChecksumAlgorithm>
    <ChecksumType>FULL_OBJECT</ChecksumType>
and


 



 


<ChecksumAlgorithm>CRC64NVME</ChecksumAlgorithm>
    <ChecksumType>FULL_OBJECT</ChecksumType>

**Jez Tucker** - 6:28:36 AM
should not be related at all.  I had this in the root of /mmfs1 with no migrated files whatever as I had not yet configured a bucket
*Reactions: 👍*


## 10/24/2025

**Justin Toribio** - 5:31:58 PM
Gareth Tucker Daniel Iwan Jason Perr Jamie Sabino It looks like the RabbitMQ server at ALT is down...





 


 



 


Connection attempt for <RobustConnection: "amqps://yIBWUJUk5drG:******@192.168.18.10:5671//?heartbeat=600&blocked_connection_timeout=300&connection_name=notification-api-consumer-f120dc3b" 0 channels>
Connecting to: amqps://yIBWUJUk5drG:******@192.168.18.10:5671//?heartbeat=600&blocked_connection_timeout=300&connection_name=notification-api-consumer-f120dc3b
error when creating transport: <AMQPConnectionError: (111, "Connect call failed ('192.168.18.10', 5671)")>

**Justin Toribio** - 5:33:08 PM
I'm connected to WireGuard, and Vision is still working at that IP address...

**Jamie Sabino** - 5:33:32 PM
Ack ^ , would have to look at the container

**Jamie Sabino** - 5:34:23 PM
I don’t think vision has any monitoring or alerting ..  I can have a look
*Reactions: 👍*

**Justin Toribio** - 5:35:23 PM
Great, thanks.  Please keep me updated

*Attachments:*
- messageReference

**Jamie Sabino** - 5:56:54 PM
ya, its alarming,  Justin Toribio , i'll keep looking but really should be something Iris team should debug as its their service.  I'll save some logs and see what i can do, (we 'shouldn't' be blowing things away here imo), (fyi Gareth Tucker Orlando Richards )


 



2025-10-25 00:52:33.604439+00:00 [warning] <0.513.0> Message store "628WB79CIFDYO9LJI6DKMI09L/msg_store_persistent": rebuilding indices from scratch

2025-10-25 00:52:47.582521+00:00 [warning] <0.360.0> memory resource limit alarm set on node 'rabbit@mcs-rabbitmq'.

2025-10-25 00:52:47.582521+00:00 [warning] <0.360.0>

2025-10-25 00:52:47.582521+00:00 [warning] <0.360.0> **********************************************************

2025-10-25 00:52:47.582521+00:00 [warning] <0.360.0> *** Publishers will be blocked until this alarm clears ***

2025-10-25 00:52:47.582521+00:00 [warning] <0.360.0> **********************************************************

2025-10-25 00:52:47.582521+00:00 [warning] <0.360.0>

2025-10-25 00:52:48.583785+00:00 [warning] <0.360.0> memory resource limit alarm cleared on node 'rabbit@mcs-rabbitmq'

2025-10-25 00:52:48.583841+00:00 [warning] <0.360.0> memory resource limit alarm cleared across the cluster

**Jamie Sabino** - 7:58:29 PM
Rabbit is back up , i blocked traffic coming in, upsized the container memory temporarily, and purged the debug queues , I'll defer to Gareth Tucker Orlando Richards to handle those other queues that are climbing (I don't know the impact, ie, if this is expected post recent upgrade and this is just a workload that needs to get through).. Justin Toribio fyi,

*Attachments:*
- Screenshot 2025-10-24 at 10.47.00 PM.png


## 10/27/2025

**Orlando Richards** - 2:58:43 AM
Hi all - with the release of PixStor 6.11, any hub deployments that are on RC builds should do this before upgrading:


systemctl stop ngeneahubngeneahubctl manage -r migrate filebrowser 0296_create_vision_migrate_recall_workflow


 


If you fail to do this, then the fixup docs are here: 


https://arcapix.atlassian.net/wiki/spaces/ORDOCS/pages/5228331010/Upgrading+from+PixStor+6.11+beta+…

**Polly Miller** - 4:37:27 AM
Hi Lucy Coade I've got some extra questions about how the Hub displays workflows in the UI (In regards to 'MCS-1688 - Full Ngenea Workflow Menu Integration'). Please let me know when you have some time to go over this

**Gareth Tucker** - 5:56:35 AM
re: Alt, has anybody enabled the Iris notify schedule on space01 recently? If so, it looks to be the cause of the problem


 





 





 


This highlights that Alt is still due an upgrade to resolve repeating events on space01. The schedule had been disabled to prevent this short term and looks like it got re-enabled around the 22nd October. The result is that Rabbit will get flooded with repeated events for space01 and everything else will fail to keep up.


 


I have disabled the schedule on space01 again for now. Orlando Richards we'll need to schedule an upgrade of Alt to prevent this issue.


 


I have also stopped the Vision Metadata API and manually purged the fs events queue as that will take forever to clear and it will be full of duplicate messages


 





 


Things still don't seem quite right as I am not seeing the schedule running for space02 at the moment. We will continue to dig deeper.

*Attachments:*
- messageReference

**Jamie Sabino** - 5:57:40 AM
Ack. ^

**Jamie Sabino** - 6:18:05 AM
Gareth Tucker Jason has a demo scheduled here on ALT for tomorrow, should we get on a bridge and ensure everything is stable? I thought while i was away ALT was upgraded and fixed up.

**Gareth Tucker** - 6:32:45 AM
Ok, I have asked for some help from Orlando to take a look into the hub jobs for us. I don't believe Alt has been touched as focus switched to getting the release out. Will keep you posted.
*Reactions: 👍*

**Jason Perr** - 7:08:36 AM
FYI. I spent about 3 hours attempting an install on Friday using the 6.11 install. Unsuccessful so far but I'm hoping to continue tomorrow. The documentation I was able to find did not cover initial installation.

**Jason Perr** - 7:09:01 AM
This was on the blackwell1 server

**Jason Perr** - 7:09:45 AM
If there is more thorough install docs for a clean system. Can someone please provide them here?

**Jason Perr** - 8:07:31 AM
Gareth Tucker ? Or Orlando Richards ? Any ideas on this?  My attempts to install and every step taken can be seen here: https://miro.com/app/board/uXjVJ5AIx5Q=/?moveToWidget=3458764644431220061&cot=14


 


The documentation I attempted to follow is here: 


https://arcapix.atlassian.net/wiki/spaces/ORDOCS/pages/4966187010/2025-06-06+IRIS+R1+Deploying+Vision+on+PixStor+6.10+dev+builds

**Gareth Tucker** - 9:25:45 AM
I will let Orlando take that one, I believe there is something more detailed for setting up a PixStor from scratch but I don't have the details

**Orlando Richards** - 9:28:49 AM
Are you using the deployment guide to install your pixstor, or just that "how to set up an iris dev environment on your pixstor" doc?

**Orlando Richards** - 9:29:14 AM
https://arcapix.atlassian.net/wiki/spaces/SG/pages/4910874730/PixStor+Deployment+And+Configuration+… <--- deployment guide

**Orlando Richards** - 9:29:59 AM
and, in fact, are you having problems deploying your pixstor? Or just deploying iris onto it?

**Jamie Sabino** - 10:08:40 AM
Jason Perr I'll wait for you to respond, my thinking is we have a couple instances to upgrade, and might be better if we have a working session for the first time to get through this (Orlando Richards fyi).

**Gareth Tucker** - 12:19:17 PM
re: Alt, it is currently stable but not still not 100%


 


RabbitMQ will no longer start with the default container RAM of 1GB, this has been increased to 2GB for the time being.


 


The "projects" bucket is inaccessible via S3 and it looks like this can block the Metadata API, so I have disabled the schedule on that bucket for now.


 


Proxies and thumbnails are not generating at the moment.


 


As mentioned above, Alt requires an upgrade to fix the issue with space01. We will look into the proxies and need for an upgrade in the morning when the rest of the team are online.

*Attachments:*
- messageReference

**Barry Evans** - 1:00:38 PM
Hey guys - it looks like the machine is just simply out of memory

**Barry Evans** - 1:00:51 PM
someone added some very large content last week

**Barry Evans** - 1:00:59 PM
and it's trying to chew through it

**Barry Evans** - 1:02:02 PM
so we can dial back the threads and the memory limits on the proxy generator


## 10/28/2025

**Lucy Coade** - 7:57:00 AM
Polly Miller Apologies, missed the message yesterday, I can provide any answers needed, we can call tomorrow if that suits better?

**Gareth Tucker** - 8:50:05 AM
Jamie Sabino Jason Perr


 


Alt looks to be in a better place now should you need to demo from it today.


 


An upgrade still needs to be planned so the schedule for space01 has been left disabled. space02 and space03 are happily processing new content and thumbnails/proxies are being generated.


 


The schedule for the "projects" space had been re-enabled overnight which had the effect of blocking the queues again. As the "projects" space is not even browsable via Vision due to S3 listing issues, I have disabled Iris on that space for now in Hub. If this does not get resolved as part of the upgrade, we will need to take a closer look at what is going on with the "projects" Space.


 


I am not seeing MetaGen at the moment for new content in space02 or space03 but I am assuming that may have been disabled whilst there were problems, as the queue for notification API is sat at 10000 entries and not moving at the moment


 





 


Please have a play and let us know if anything is not working for you. Thanks.

**Jason Perr** - 9:14:13 AM
Will do. Thanks

**Jamie Sabino** - 9:18:54 AM
ack ^ Gareth Tucker , let's let Jason Perr do his thing today, my understanding is Justin has things setup the way its needed for Jason today and likely behind the issue.. (sidebar, will be looking at Cardiff quickly as well today, lost the mmfs mount again  , but should be able to sort that out)
*Reactions: 👍*

**Justin Toribio** - 11:47:58 AM
Gareth Tucker Jamie Sabino Just got my internet activated at my new place, so I'm online temporarily to help support Jason through the demo.


 


Yes, I disabled Iris integration and RMQ on AI+ at Alt due to the issues.  I don't want to re-enable them with those 10k msgs in the queue, for fear of creating a processing backlog during the demo.


 


Gareth Tucker is it ok if we just purge that queue?

*Attachments:*
- messageReference

**Gareth Tucker** - 11:49:54 AM
Sure, you are free to purge that Justin Toribio I doubt there will be much in there that you are interested in and as you say, you don't need a backlog
*Reactions: 👍*

**Justin Toribio** - 11:50:46 AM
Great, thanks. Will purge it now
*Reactions: 👍, 👍*

**Justin Toribio** - 11:55:13 AM
Gareth Tucker I think I read earlier that you disabled the vision-metadata_xchg?  Has that been re-enabled?

**Gareth Tucker** - 11:56:51 AM
I disabled the process that consumes from there so that I could clear some stuck messages, it is back enabled now though
*Reactions: 👍*

**Justin Toribio** - 12:16:51 PM
Gareth Tucker Jamie Sabino Iris and RMQ integration re-enabled at ALT and all services appear to be processing correctly.  Jason's in the demo meeting now, so let's please keep ALT untouched until that's over
*Reactions: 👍, 👍*

**Jamie Sabino** - 12:52:04 PM
Justin Toribio thanks for checking on your PTO … good luck Jason!


## 11/3/2025

**Jason Perr** - 10:44:54 AM
Orlando Richards I've been stuck here on trying to get the pixstor apply command to complete. Any ideas off the top of your head of what I might be missing?


 


I've been stuck here: 


----------

          ID: FQDN hostname warning

    Function: apnotify.notify

      Result: False

     Comment: 

     Changes:   

              ----------

              ERROR:

                  FQDN detected as short hostname. This will cause errors in ACS services. Please set the short hostname correctly and restart the ACS services.


 


Summary for vision.pixstor

--------------

Succeeded: 894 (changed=3)

Failed:      1

--------------

Total states run:     895


 


 


My original hostname looked like this


hostname

vision.pixstor


 


I also tried this:


hostname

vision.pixstor.local


## 11/4/2025

**Orlando Richards** - 12:33:07 AM
Hi Jason - your hostname should be vision

**Orlando Richards** - 12:33:52 AM
that error message is a bit confusing I see - it's saying "the short hostname has been set to a fully qualified one. Please set it to just the hostname"

**Jason Perr** - 8:07:10 AM
The error is basically opposite of what would make sense to me . I will try that.

**Justin Toribio** - 8:23:59 AM
Orlando Richards Gareth Tucker Daniel Iwan Jamie Sabino Is the Pixit server at Alt down (192.168.18.10)?  I still see the landing page...





 


 


But nothing there is working...

**Daniel Iwan** - 8:32:52 AM
not sure what the reason for it is but none of the vision services are running atm Justin Toribio

**Daniel Iwan** - 8:38:20 AM
in fact services are no longer listed and containers have been stopped on Oct 30. Maybe services have been moved to another node?

**Daniel Iwan** - 8:39:01 AM
I'm looking at 192.168.18.10 and https://perifery.atlassian.net/wiki/spaces/IRIS/pages/4498358277/Alt+Systems+Environment

**Daniel Iwan** - 8:40:17 AM
Other services also not happy

*Attachments:*
- Screenshot 2025-11-04 at 16.36.10.png

**Daniel Iwan** - 8:44:38 AM
actually vision services are there, just in inactive dead state. I would need  confirmation it's ok to restart considering errors in the screenshot

**Orlando Richards** - 9:26:14 AM
Daniel Iwan - infrastructure issue it seems:


 



 


root@alt-mn-001:~ # df -h /mmfs1
df: /mmfs1: Stale file handle

**Justin Toribio** - 9:28:23 AM
Daniel Iwan Orlando Richards thanks for looking into it.  Please keep me updated as I need to run some end-to-end tests there.

**Orlando Richards** - 9:29:11 AM
the whole network is gone

**Daniel Iwan** - 9:28:44 AM
that's not going to work then  mountpoint gone

**Orlando Richards** - 9:29:56 AM
root@alt-mn-001:~ # ping 10.100.0.2
PING 10.100.0.2 (10.100.0.2) 56(84) bytes of data.
^C
--- 10.100.0.2 ping statistics ---
1 packets transmitted, 0 received, 100% packet loss, time 0ms

[Px] Staging mode     [Px]
root@alt-mn-001:~ # ping 10.100.0.3
PING 10.100.0.3 (10.100.0.3) 56(84) bytes of data.
^C
--- 10.100.0.3 ping statistics ---
1 packets transmitted, 0 received, 100% packet loss, time 0ms

[Px] Staging mode     [Px]
root@alt-mn-001:~ # ping 10.100.0.4
PING 10.100.0.4 (10.100.0.4) 56(84) bytes of data.
^C
--- 10.100.0.4 ping statistics ---
1 packets transmitted, 0 received, 100% packet loss, time 0ms

[Px] Staging mode     [Px]
root@alt-mn-001:~ # ping 10.100.0.11
PING 10.100.0.11 (10.100.0.11) 56(84) bytes of data.
64 bytes from 10.100.0.11: icmp_seq=1 ttl=64 time=0.530 ms
^C
--- 10.100.0.11 ping statistics ---
1 packets transmitted, 1 received, 0% packet loss, time 0ms
rtt min/avg/max/mdev = 0.530/0.530/0.530/0.000 ms



looks like all the pixstor nodes are down

**Jez Tucker** - 9:30:35 AM
alt lab is too hot. they shut everything down except the management node iirc (see slack labchannel).  I am not the holder of info as to when that might be resolved.

**Orlando Richards** - 9:32:18 AM


**Jamie Sabino** - 11:52:49 AM
This should be fun..

**Orlando Richards** - 9:35:53 AM
there's a large customer build going on in that facility just now - I'm guessing they powered the lab off to make room for that (cooling + power room, not physical)
*Reactions: 👍*

**Orlando Richards** - 9:35:31 AM
Justin Toribio - no Alt lab just now. I've asked the person who powered it down what the plans are for bringing it back up
*Reactions: 👍*

**Justin Toribio** - 5:52:04 PM
Thanks for the info Orlando.  Who's the contact we can follow-up with to check on the status?

*Attachments:*
- messageReference


## 11/5/2025

**Jamie Sabino** - 2:57:05 AM
Never heard of Adam, we've used a couple different people at Alt, is there an email thread?

**Orlando Richards** - 3:05:43 AM
Adam's Datacore, not Alt

**Jamie Sabino** - 3:56:05 AM
and he's onsite at Alt?

**Orlando Richards** - 3:56:58 AM
not sure where he is - but he's the one who shut the cluster down because it was too hot!

**Orlando Richards** - 3:57:28 AM
he's "in America" somewhere

**Jamie Sabino** - 4:01:40 AM
didn't know we had datacore folks onsite at ALT that had access, i used to go through ALT IT team.. but cool!

**Gareth Tucker** - 4:35:10 AM
Erik Salter does today work at all for the high level Vision code walkthrough for you?

**Erik Salter** - 5:20:02 AM
I don't have anything on my calendar.

**Gareth Tucker** - 5:26:14 AM
Cool, please contact Daniel Iwan direct to arrange a session and he will bring in Ivan Cruces and Bogdan Stanciu to assist.
*Reactions: 👍*

**Erik Salter** - 5:33:35 AM
Sure.  What version of Java and Gradle are you using?

**Daniel Iwan** - 5:35:44 AM
we are on Java 17 mostly, Gradle is usually 8.6

**Erik Salter** - 5:36:24 AM
OpenJDK, I trust?
*Reactions: 👍*

**Orlando Richards** - 5:49:36 AM
Jamie Sabino - instructions for wiping Vision on a dev instance are in the "Troubleshooting / Reinstalling Vision" section of this doc: https://arcapix.atlassian.net/wiki/spaces/ORDOCS/pages/5147983873/2025-09-19+IRIS+R2+Deploying+Visi…


 


Summary:






 


systemctl | grep mcs | grep vision-component | gawk '{print $1}' | while read service; do systemctl disable --now ${service}; systemctl reset-failed ${service}; done;
export KEYCLOAK_MASTER_USERNAME=pixstor_admin
export KEYCLOAK_MASTER_PASSWORD=$(grep keycloak.admin_password /etc/salt/minion.d/pixstor.conf | gawk '{print $NF}')
export PATH=/var/lib/pixstor/iris/python:$PATH
/var/lib/pixstor/iris/mcs-runtime/scripts/vman.sh cleanup realm --mcs-realm-roles --all-mcs-clients
/var/lib/pixstor/iris/mcs-runtime/scripts/destroy.sh
rmdir /var/lib/pixstor/iris/mcs-runtime
rm -f /var/log/vision_install.log
pixstor apply

**Orlando Richards** - 5:56:03 AM
For our prometheus deployments, you can see the provisioned configuration files at:


 



 


# ls /var/lib/pixstor/prometheus/conf.d/
alertrules.yml  prometheus.yml
 


and alertmanager at:


 



 


# ls /var/lib/pixstor/alertmanager/conf.d/
alertmanager.yml
The source code for the templates for these files can be found at:


 



 


# ls /opt/arcapix/salt/states/monitoring/files/prometheus/
alertrules_map.py  prometheus.yml
 


and


 



 


# ls /opt/arcapix/salt/states/monitoring/files/alertmanager/
alertmanager.yml.template
And in the bitbucket repo at: 


https://bitbucket.org/arcapix/pixstor/src/main/pixstor-manager/salt/states/monitoring/files/prometh…


and


https://bitbucket.org/arcapix/pixstor/src/main/pixstor-manager/salt/states/monitoring/files/alertma…


 


General guidance/requirements on writing prometheus exporters:



Make sure it returns results in < 1s for most metrics. For longer collections, put it under a separate URL namespaceSupport a variable baseurl to allow proxying if requiredInclude TLS transport support, with customisable key/cert locationsInclude basic auth support (via htaccess is fine if desired)

 
For the bulk of our custom collectors, we use prometheus-script-exporter : https://github.com/ricoberger/script_exporter 


Our code can be seen here: https://bitbucket.org/arcapix/pixstor-prometheus-exporters/src/main/


and also on your pixstor at /usr/share/pixstor/pixstor-prometheus-exporters/


 


Our grafana dashboards can be found on your pixstor at the /grafana/ url: 



 


https://my.pixstor/grafana/
 


and also on the filesystem at: 


 



 


/usr/share/pixstor-monitoring/grafana/provisioning
 


and in bitbucket here: 


https://bitbucket.org/arcapix/pixstor-monitoring/src/master/grafana/provisioning/

**Orlando Richards** - 6:04:54 AM
I've added all the above to a confluence page for posterity: https://arcapix.atlassian.net/wiki/spaces/ORDOCS/pages/5262082049/2025-11-05+PixStor+Monitoring+Sof…

**Jamie Sabino** - 7:52:04 AM
Ack^

**Orlando Richards** - 12:27:04 AM
Adam Young is the main "boots on the ground" engineer. I'll drop a note in here if I spot any change in the situation though.
*Reactions: 👍*

**Justin Toribio** - 3:46:00 PM
Gareth Tucker Daniel Iwan Orlando Richards With Alt being down, I need another full E2E env that has the latest version of Vision so I can continue my Object Recognition development and testing.  Is it alright if I use Cardiff for this purpose until Alt is back up?  I'll ensure that MetaGen is always back to a working state whenever I'm finished for the day.

**Justin Toribio** - 3:46:05 PM
And is it ok if I create a personal test folder in the qa space? Because space01 seems to be buggy and unstable for some reason.  I.e. it will become unresponsive and then give this message...

**Justin Toribio** - 3:48:35 PM
Please let me know, thanks.

**Gareth Tucker** - 3:49:34 PM
Sure, no probs Justin Toribio

*Attachments:*
- messageReference
*Reactions: 👍*

**Gareth Tucker** - 3:51:07 PM
Use of the qa space is also fine, space01 is intentionally broken at the moment as part of an investigation that we are doing.

*Attachments:*
- messageReference
*Reactions: 👍*

**Justin Toribio** - 3:54:45 PM
Great, thanks Gareth Tucker.  Please note: when I'm on and have MetaSight (Obj Rec) running, I'll have to stop the Triton container, so MetaGen won't work during these periods.  But, again, I'll always make sure to start it back up and ensure MetaGen is working properly whenever I finish my working sessions.
*Reactions: 👍*


## 11/6/2025

**Jason Perr** - 8:42:54 AM
Everyone I have Vision up and running in my environment but now I get this error anytime I log into Vision:


Cross-Origin Request Blocked: The Same Origin Policy disallows reading the remote resource at https://vision.pixstor/keycloak/realms/iris/protocol/openid-connect/token. (Reason: CORS header ‘Access-Control-Allow-Origin’ does not match ‘https://vision.pixstor:9505, *’).


 


Any ideas?

**Daniel Iwan** - 8:47:15 AM
you should only see access to 443 port, not 9505, so looks like some configuration is not right

**Jason Perr** - 8:48:15 AM
interesting...

**Gareth Tucker** - 8:49:00 AM
yeah. That's the Keycloak redirect URL config by the look of it Daniel Iwan?

**Daniel Iwan** - 8:49:28 AM
what's the output of 






 


cat /var/lib/pixstor/iris/mcs-runtime/environment.properties | grep -Ev '(^$|^#)' | sort

**Jason Perr** - 8:50:06 AM
cat /var/lib/pixstor/iris/mcs-runtime/environment.properties | grep -Ev '(^$|^#)' | sort

CONTAINER_REGISTRY_USER=hwdemolab

IRIS_DEPLOYMENT_ENABLED=true

KC_HOSTNAME=vision.pixstor

MCS_CONTAINER_REGISTRY_ADDRESS=docker-registry.mcsdev:5000

MCS_CONTAINER_REGISTRY_ADDRESS=eurepo.arcapix.com/arcapix/vision

MCS_ELASTICSEARCH_EXPOSED_PORT=29200

MCS_ELASTICSEARCH_EXPOSED_PORT=9200

MCS_FFMPEG_UNPACKED_DIR=/usr/share/vision/ffmpeg/bin

MCS_KEYCLOAK_AUTH_SERVER_URL=https://vision.pixstor/keycloak

MCS_KEYCLOAK_CA_CERT_PATH=/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem

MCS_S3_REGION=us-east-1

MCS_S3_URL=https://vision.pixstor

MCS_SKIP_INSTALL_OF_BUCKETSCANNER=no

MCS_SKIP_INSTALL_OF_BUCKETSCANNER=true

MCS_STORAGE_TYPE=ngenea

MCS_TENANT_DISPLAY_NAME=Iris

MCS_TENANT_NAME=iris

MCS_TENANTS_VISION_REDIRECT_URIS=https://vision.pixstor:9505/*

MCS_VISION_API_EXTERNAL_URL=https://vision.pixstor:9505/api/v1

MCS_VISIONAPI_FILTERS_EXCLUDE_DIRNAME_PATTERNS=

MCS_VISIONAPI_FILTERS_EXCLUDE_FILENAME_PATTERNS=

MCS_VISIONAPI_FILTERS_EXCLUDE_KEYS=

MCS_VISION_URL=https://vision.pixstor:9505

NGENEA_URL=https://vision.pixstor

OPENSEARCH_CA_CERT_PATH=/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem

OPENSEARCH_URL=https://vision.pixstor:19200

PORT_443_IN_USE=true

POSTGRES_CA_CERT_PATH=

POSTGRES_HOST=vision.pixstor:5433

POSTGRES_JDBC_EXTRA_PARAMS=targetServerType=primary

POSTGRES_JDBC_PARAMS=?targetServerType=primary

POSTGRES_JDBC_SSL_MODE=disable

POSTGRES_SSL_ENABLED=false

RABBITMQ_AMQP_PORT_BINDING=127.0.0.1:5672:5672

RABBITMQ_AMQP_TLS_PORT_BINDING=5671:5671

RABBITMQ_MGMT_PORT_BINDING=127.0.0.1:15672:15672

RABBITMQ_MGMT_TLS_PORT_BINDING=15671:15671

S3_CA_CERT_PATH=/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem

VAULT_PORT_BINDING=8200:8200

**Daniel Iwan** - 8:55:24 AM
so MCS_VISION_URL should be set to something like https://vision.pixstor/iris during installation. The other values are derived from that

**Daniel Iwan** - 8:57:42 AM
here are our values from dev-01 environment, for reference 






 


cat /var/lib/pixstor/iris/mcs-runtime/environment.properties | grep -Ev '(^$|^#)' | sort
CONTAINER_REGISTRY_USER=cademolab
IRIS_DEPLOYMENT_ENABLED=true
KC_HOSTNAME=ca-sn-dev-01.om.cardifflab
MCS_CONTAINER_REGISTRY_ADDRESS=832471001844.dkr.ecr.us-east-1.amazonaws.com/vision
MCS_ELASTICSEARCH_EXPOSED_PORT=29200
MCS_ELASTICSEARCH_EXPOSED_PORT=9200
MCS_FFMPEG_UNPACKED_DIR=/usr/share/vision/ffmpeg/bin
MCS_KEYCLOAK_AUTH_SERVER_URL=https://ca-sn-dev-01.om.cardifflab/keycloak
MCS_KEYCLOAK_CA_CERT_PATH=/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
MCS_S3_REGION=us-east-1
MCS_S3_URL=https://ca-sn-dev-01.om.cardifflab
MCS_SKIP_INSTALL_OF_BUCKETSCANNER=no
MCS_SKIP_INSTALL_OF_BUCKETSCANNER=true
MCS_STORAGE_TYPE=ngenea
MCS_TENANT_DISPLAY_NAME=Iris
MCS_TENANT_NAME=iris
MCS_TENANTS_VISION_REDIRECT_URIS=https://ca-sn-dev-01.om.cardifflab/iris/*
MCS_VISION_API_EXTERNAL_URL=https://ca-sn-dev-01.om.cardifflab/iris/api/v1
MCS_VISION_URL=https://ca-sn-dev-01.om.cardifflab/iris
NGENEA_URL=https://ca-sn-dev-01.om.cardifflab
OPENSEARCH_CA_CERT_PATH=/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
OPENSEARCH_URL=https://ca-sn-dev-01.pixstor:19200
PORT_443_IN_USE=true
POSTGRES_CA_CERT_PATH=
POSTGRES_HOST=ca-sn-dev-01.pixstor
POSTGRES_JDBC_EXTRA_PARAMS=targetServerType=primary
POSTGRES_JDBC_PARAMS=?targetServerType=primary
POSTGRES_JDBC_SSL_MODE=disable
POSTGRES_SSL_ENABLED=false
RABBITMQ_AMQP_PORT_BINDING=127.0.0.1:5672:5672
RABBITMQ_AMQP_TLS_PORT_BINDING=5671:5671
RABBITMQ_MGMT_PORT_BINDING=127.0.0.1:15672:15672
RABBITMQ_MGMT_TLS_PORT_BINDING=15671:15671
S3_CA_CERT_PATH=/etc/pki/ca-trust/extracted/pem/tls-ca-bundle.pem
VAULT_PORT_BINDING=8200:8200
*Reactions: 👍*

**Daniel Iwan** - 8:59:30 AM
Thos values can be modified in the props file + containers restart, but you will also need to modify config in Keycloak, iris realm mcs-vision client Redirect URL

**Jason Perr** - 9:45:06 AM
Daniel Iwan Where do I find that in Keycloak?

**Gareth Tucker** - 9:49:38 AM


**Gareth Tucker** - 9:50:37 AM
select "mcs-vision" as the client

**Gareth Tucker** - 9:51:55 AM
you also need to change realm first to "iris" by clicking on "Manage realms" on the left

**Jason Perr** - 9:53:33 AM


**Jason Perr** - 11:30:05 AM
Orlando Richards Where are the docs that cover setup of a VM (If we happen to have one). Would love to know specific recommendations for things like the networking etc

**Jason Perr** - 11:31:51 AM
Everyone does anyone know what I should be choosing to setup the 2nd network for the VM for th 6.11 ISO?

**Jason Perr** - 1:03:52 PM
Orlando Richards following this document: https://arcapix.atlassian.net/wiki/spaces/SG/pages/4911497262/PixStor+Deployment+-+PixStor+Installa…


 


I can not really get past step 1. 


It would be very helpful to include specific guidence if possible about installation to a VM environment either in this page or on its own page. Understanding what exactly is needed for the network setup would be very helpful. I made the best guesses I could on the newtork and completed the initial install. 


 


the first step in the instructions says to run this command:


## Change this to the address to be used in the browser URL bar to connect to the Vision interface:pixstor config set iris:vision:server_address pixstor-mn-01.example.com## or, if no DNS will be available:pixstor config set iris:vision:server_address 192.0.2.1


 


The exact command I attempted to run was


pixstor config set iris:vision:server_address 192.180.122.1


 


The result of this is the error below:


## 11/7/2025

**Orlando Richards** - 12:34:47 AM
Hey Jason - have we got remote access to that system?

**Orlando Richards** - 12:36:11 AM
We don't have any specific docs for deploying to your VM lab - we don't support those kind of solutions from Product Development, just hardware or cloud. For bespoke deployments (we do have a few VMWare) we provide professional services.

**Jason Perr** - 12:36:51 AM
https://perifery.atlassian.net/wiki/spaces/IRIS/pages/4509499421/Jason+Office+Environment

**Jason Perr** - 12:36:56 AM
I figured as much

**Orlando Richards** - 12:37:36 AM
ooh - is that an openvpn config on confluence? Neat

**Jason Perr** - 12:37:50 AM
yep

**Orlando Richards** - 12:37:59 AM
the king of vpns - nice and easy!

**Orlando Richards** - 12:39:31 AM
got an IP for the vision node for me?

**Jason Perr** - 12:42:33 AM
172.16.1.157

**Orlando Richards** - 12:43:25 AM
hmm - not pinging...

**Jason Perr** - 12:43:30 AM
Not sure where I last left it though. I was trying to start fresh after going down a lot of rabbit holes

**Jason Perr** - 12:43:35 AM
might not be up at the moment

**Jason Perr** - 12:43:59 AM
let me check

**Orlando Richards** - 12:44:30 AM
it would seem so - holler if it's up and you want me to nip on and have a look. Since it's past your bedtime (  ) do you want me to just see if I can fix it up in situ during my working day?
*Reactions: 👍*

**Jason Perr** - 1:26:13 AM
Orlando Richards let me know how it goes. Also, there is a vnc connection available to the host ubuntu 22 desktop in case you need it.


IP: 172.16.1.222


vnc pass: ubuntu123

**Jason Perr** - 1:25:01 AM
the VM is back up and running.  I ended up going back to a mostly clean slate. Access to the VM server is here:


172.16.1.95 is the main IP to use. This is a clean install from the 6.11 newest image.


 


https://share.1password.com/s#JpXjp9JdKQToRnoZPj6qTIwyus2vvg0D5VquKF_QlfU

**Orlando Richards** - 1:59:26 AM
ok - looks like it is, indeed, a clean slate. Vision isn't working because it's not running as a pixstor just now - never mind a vision enabled pixstor

**Orlando Richards** - 2:01:19 AM
I'll get it bootstrapped:






 


root@vision:~ # pixstor cluster create
Configuring cluster creation...
  Loading network information...
[?] Select the backplane interface:
   enp1s0:  172.16.1.95/24      IP Mode: dhcp  Link UP  Speed: Unknown  MTU: auto  Gateway: 172.16.1.1
> enp7s0:  192.168.100.216/24  IP Mode: dhcp  Link UP  Speed: Unknown  MTU: auto  Gateway: None
   dummy0:                      IP Mode: None  Link UP  Speed: Unknown  MTU: 1500  Gateway: None
   Edit network configuration...
   Back..

[?] Select the management interface:
> enp1s0:  172.16.1.95/24      IP Mode: dhcp  Link UP  Speed: Unknown  MTU: auto  Gateway: 172.16.1.1
   enp7s0:  192.168.100.216/24  IP Mode: dhcp  Link UP  Speed: Unknown  MTU: auto  Gateway: None
   dummy0:                      IP Mode: None  Link UP  Speed: Unknown  MTU: 1500  Gateway: None
   Edit network configuration...
   Back..

[?] Please enter the root password, or press enter to accept the default: "0daughter&ribcage1BACKTRACK4shredding&": *******
[?] Please enter the software repository username: jperr
[?] Please enter the software repository password: ******
[?] Please enter the product brand:
> Pixit Media
   Arcastream

[?] Create or join a Hub for this cluster?:
> Create a new Hub
   Join an existing Hub
   Do not use Hub

[?] Please enter the cluster site name: jasonlab
This will create a new pixstor cluster with the following options:
    Backplane interface: Wired connection 1
    Management interface: enp1s0
    Yum repo user: jperr
    Yum repo pass: ******
    Branding: PIXIT
    Skip registration: False
    Development mode: False
    Create new hub: True
    Site name: jasonlab
[?] Continue?:
> Yes
   No

**Orlando Richards** - 2:01:59 AM
looks like it doesn't have any storage attached - so I'll make a "fake" file system on it

**Orlando Richards** - 4:37:12 AM
All done Jason, and you have Vision up and running. You'll need to access it via the url:


 


https://172.16.1.95/

**Orlando Richards** - 4:38:12 AM
i didn't have to do anything "special" to cope with your infrastructure, so I've no idea what problems you were having!

**Orlando Richards** - 4:38:56 AM
We did spot an issue with that pixstor build though - it's got the wrong version of versitygw in it, so the proxies weren't working properly for Vision. That's fixed on your node (and in the new patched image for PixStor - 6.11.1-2)

**Jason Perr** - 7:49:45 AM
Id love to do a session together to see how you did it. I tried for 2 days with no results.

**Jason Perr** - 8:48:05 AM
Orlando Richards in not able to get to anything at that address.

**Orlando Richards** - 8:49:14 AM
send a screenshot of your full browser window?


## 11/9/2025

**Justin Toribio** - 7:42:41 PM
Gareth Tucker just a heads up, will be working on MetaSight at Cardiff, so MetaGen won't be working there for the next little bit

