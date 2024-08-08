---
title: Python B站视频爬虫

description: 简易的B站视频爬虫

tag:
 - 陈年往事
 - Python
 - 爬虫

---

# Python B站视频爬虫

## 非大会员番剧爬虫

基于上一篇的视频爬虫改过来的，不能爬取大会员番剧，需要安装 **`ffmpeg`**！

需要填写番剧网址上的番剧编号并选择番剧的编号前缀

在b站反爬更新之前应该有效
```python
# -*- coding = utf-8 -*-
# @File:anime_crawler.py
# @Author:Hycer_Lance
# @Time:2022/4/3 20:49
# @Software:PyCharm

#封装成函数是为了方便理清思路，实际只需很少的代码

import sys
import time
import requests
import re
import json
import subprocess
import os


def select_mode():
# 选择下载模式
try:
print('Select download mode')
print('___1___    ___2___')
print('Single     Multiple')
download_mode = input('Select:>')
if download_mode == '2':
num = int(input("Enter the number of episodes to download:"))
elif download_mode == '1':
num = 1
else:
print('No such mode')
sys.exit()
return num
except Exception as result:
print(result)
print("Please retry")
sys.exit()


# 判断编号前缀
def determine_prefix():
# 判断编号前缀
try:
number_type = input("Select number type (ep/ss):")
if number_type == 'ep':
flag = 'ep'
elif number_type == 'ss':
flag = 'ss'
else:
print("An unrecognized type")
sys.exit()
return flag
except Exception as result:
print(result)
print("Please retry")
sys.exit()


# 获取网页源码
def get_html_res(flag, av):
try:
baseurl = "https://www.bilibili.com/bangumi/play/" + flag + av
print("The video URL:", baseurl)
html_res = requests.get(baseurl, headers=headers).text  # 获取网页源码
# print(html_res)
return html_res
except Exception as result:
print(result)
print("Please retry")
sys.exit()


# 获取番剧信息
def get_playinfo(html_res):
try:
playinfo = re.findall("", html_res)[0]  # 正则表达式提取音视频网址
return playinfo
except Exception as result:
print(result)
print("Please retry")
sys.exit()


# 转换成json文件
def conversion_json(playinfo):
try:
json_data = json.loads(playinfo)  # 转换为json数据
return json_data
except Exception as result:
print(result)
print("Please retry")
sys.exit()


# 获取番剧名字
def get_title1(html_res):
try:
title1 = re.findall('
```

## B站视频爬虫

b站上的视频都是音视频分离的
电脑上需要安装`ffmpeg`来合成下载下来的音视频
在b站反爬更新之前可以成功爬取视频不能爬番剧

```python
import sys
import time

import requests
import re#正则表达式
import json
import pprint#格式化输出方便查看数据
import subprocess
import os

try:
bv=input("BV:")
baseurl="https://www.bilibili.com/video/"+bv
print("The video URL:", baseurl)
headers={"user-agent":"Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.60 Safari/537.36",
"referer": "https://www.bilibili.com"}

html_res=requests.get(baseurl, headers=headers).text#获取网页源码

title1=re.findall('', html_res)[0]#提取标题 并取第一个元素（变成字符串）
print("The video title:", title1)
title2=bv
except Exception as result:
print(result)
print("Please retry")
sys.exit()

try:
playinfo=re.findall("", html_res)[0]#正则表达式提取音视频网址
json_data=json.loads(playinfo)#转换为json数据
# pprint.pprint(json_data)

video_url=json_data['data']['dash']['video'][0]['baseUrl']#提取视频地址
print("Get video URL successfully")
audio_url=json_data['data']['dash']['audio'][0]['baseUrl']#提取音频地址
print("Get audio URL successfully")
except Exception as result:
print(result)
print("Please retry")
sys.exit()

try:
print("Start downloading video data...")
get_video=requests.get(url=video_url, headers=headers).content#以二进制获取视频
print("Download video data successfully")
time.sleep(1.5)

print("Start downloading audio data...")
get_audio=requests.get(url=audio_url, headers=headers).content#以二进制获取音频
print("Download video data successfully")
time.sleep(1.5)
except Exception as result:
print(result)
print("Please retry")
sys.exit()

try:
#保存音视频
print("Start writing video data...")
with open(title2+'_video.mp4', mode='wb') as f:
f.write(get_video)
print("Write video data successfully")
time.sleep(1)

print("Start writing audio data...")
with open(title2+'_audio.mp3', mode='wb') as f:
    f.write(get_audio)
print("Write video data successfully")
time.sleep(1)
except Exception as result:
print(result)
print("Please retry")
sys.exit()

try:
#利用子进程调用系统的ffmpeg合成音视频
print("Start synthesizing audio and video...")
#用bv号命名合成放在因标题的非法字符导致命令报错
subprocess.call(f"ffmpeg -i {title2}_video.mp4 -i {title2}_audio.mp3 -c:v copy -c:a aac -strict experimental {title2}.mp4")
os.rename(f'{title2}.mp4', f'{title1}.mp4')#给文件重命名
print("Synthesize audio and video successfully")
print(f'The video {title1} is saved in '+os.getcwd())
time.sleep(2)

except Exception as result:
print(result)
print("Please retry")
sys.exit()

try:
os.remove(os.getcwd() +f'/{title2}_video.mp4')
os.remove(os.getcwd() +f'/{title2}_audio.mp3')# 删除音视频
except Exception as result:
print(result)
print("Failed to delete audio and video files, you can delete them manually")
```
