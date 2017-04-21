import json
from django.shortcuts import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from Editor import models
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from django.http import JsonResponse

# 在views.py文件里每个视图对应一个单独的函数.在这个例子中我们只创建了一个index视图.
serverVersion = 0
op = []

# 每个视图至少带一个参数 - 一个在django.http模块的HttpRequest对象.
# 每个视图都要返回一个HttpResponse对象.本例中这个HttpResponse对象把一个字符串当做参数传递给客户端.
# 虽然已经创建了视图,但是如果想让别人看到它,你必须用URL映射这个视图.

@csrf_exempt
def index(request):
    title = {'title': "Welcome to the Editor"}
    return render(request, 'editor/index.html', title)

@csrf_exempt
def addString(request):
    global serverVersion
    print("[Server]HTTP Request Type: " + request.method)
    if request.method == 'POST':
        ip = get_client_ip(request)
        print("[Server]From Client:" + ip)
        print("- -- - - - - - --- ")
        data =json.loads(request.POST.get('msg'))
        if data['type'] == "fetchfile":
            print("[Server]: Receiving fetchfile")
            try:
                file_value = models.File.objects.get(Line=data['fileName'])
                return JsonResponse({"type":"Init", "content": file_value.String,"version":serverVersion})
            except ObjectDoesNotExist:
                print('no file')
                return JsonResponse({"type":"NoFile", "content":"No File Failed"})
        elif data['type'] == 'heartBeat':
            print("[Server]: Receiving HeartBeat")
            clientVersion = data['version']
            if serverVersion == clientVersion:
                return JsonResponse({"type": "Heartbeat", "newOp": ""})
            elif serverVersion > clientVersion:
                return JsonResponse({"type": "Append", "newOp": op[clientVersion:serverVersion], "version": serverVersion})
            else:
                return JsonResponse({"type": "Rejected", "content": "Unexpected Failed in type : HeartBeat"})

        elif data['type'] == 'newOp':
            print("[Server]: Receiving newOp")
            clientVersion = data['version']
            if serverVersion == clientVersion:
                op.append(data['Op'])
                serverVersion += 1
                return JsonResponse({"type": "Updated", "version": serverVersion})
            elif serverVersion > clientVersion:
                return JsonResponse({"type": "Append", "newOp": op[clientVersion:serverVersion], "version": serverVersion})
            else:
                return JsonResponse({"type":"Rejected","content": "Unexpected Failed in type : newOp"})
        else:
            print('no type!')
            return JsonResponse({"content":"Unexpected Failed"})
    else:
        return HttpResponse("[Server Reply]NONONO")


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip

def dealData(data):
    data_str = ""
    for item in data:
        if item['type'] == "ins":
            data_str += item['text'][0]
    return data_str
