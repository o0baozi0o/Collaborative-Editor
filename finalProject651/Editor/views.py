import json
from django.shortcuts import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from Editor import models
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from django.http import JsonResponse
import ast
from Editor import load
from threading import Thread, Lock


# 在views.py文件里每个视图对应一个单独的函数.在这个例子中我们只创建了一个index视图.
# serverVersion = 0
# op = []

# load op, server version from MySQL database when server start up

for entry in models.Ver.objects.all():
    entry.delete()

op = []
serverVersion = 0
mutex = Lock()
# op, serverVersion = load.loadFromSQL()
# client_Sn = {}

# 每个视图至少带一个参数 - 一个在django.http模块的HttpRequest对象.
# 每个视图都要返回一个HttpResponse对象.本例中这个HttpResponse对象把一个字符串当做参数传递给客户端.
# 虽然已经创建了视图,但是如果想让别人看到它,你必须用URL映射这个视图.

@csrf_exempt
def index(request):
    title = {'title': "Welcome to the Editor"}
    return render(request, 'editor/index.html', title)

@csrf_exempt
def addString(request):
    global mutex
    global serverVersion
    global op
    mutex.acquire();
    rst = JsonResponse({"type":"WrongType"})
    try:
        if request.method == 'POST':
            ip = get_client_ip(request)
            data = json.loads(request.POST.get('msg'))
            if data['type'] == "fetchfile":
                rst = JsonResponse({"type":"Init", 'file':'Hello World',"version":0})
            elif data['type'] == 'heartBeat':
                clientVersion = data['version']
                if serverVersion == clientVersion:
                    rst = JsonResponse({"type": "Heartbeat", "newOp": ""})
                elif serverVersion > clientVersion:
                    print('HeartBeat responds append')
                    rst = JsonResponse({"type": "Append", "newOp": op[clientVersion:serverVersion], "version": serverVersion})
                else:
                    # Possible situation:
                    #   Primary server down
                    #   This server(backup) take over
                    #   client version is higher than server version(0)
                    #   retrieve op and server version from database and check client version again.
                    op, serverVersion = loadFromSQL()
                    addString(request)
                    # if serverVersion == clientVersion:
                    #     return JsonResponse({"type": "Heartbeat", "newOp": ""})
                    # elif serverVersion > clientVersion:
                    #     return JsonResponse({"type": "Append", "newOp": op[clientVersion:serverVersion], "version": serverVersion})
                    # else:
                    #     return JsonResponse({"type": "Rejected", "content": "Unexpected Failed in type : HeartBeat"})
    
            elif data['type'] == 'newOp':
                print("[Server]: Receiving newOp")
                clientVersion = data['version']
                if serverVersion == clientVersion:
                #   appendLog(str(data['Op']))
                    op.append(data['Op'])
                    serverVersion += 1
                    rst = JsonResponse({"type": "Updated", "version": serverVersion})
                elif serverVersion > clientVersion:
                #    appendLog(str(data['Op']))
                    op.append(data['Op'])
                    serverVersion += 1
                    rst = JsonResponse({"type": "NeedUpdate", "newOp": op[clientVersion:serverVersion-1], "version": serverVersion})
                else:
                    # Possible situation:
                    #   Primary server down
                    #   This server(backup) take over
                    #   client version is higher than server version(0)
                    #   retrieve op and server version from database and check client version again.
                    op, serverVersion = loadFromSQL()
                    addString(request)
                    # if serverVersion == clientVersion:
                    #     return JsonResponse({"type": "Heartbeat", "newOp": ""})
                    # elif serverVersion > clientVersion:
                    #     return JsonResponse(
                    #         {"type": "Append", "newOp": op[clientVersion:serverVersion], "version": serverVersion})
                    # else:
                    #     return JsonResponse({"type": "Rejected", "content": "Unexpected Failed in type : newOp"})
                # else:
                #     return JsonResponse({"type": "Updated", "version": serverVersion})
            else:
                print('no type!')
                rst = JsonResponse({"content":"Unexpected Failed"})
        else:
            rst = HttpResponse("[Server Reply]NONONO")
    except:
        pass
    mutex.release()
    return rst;

def appendLog(op):
    global serverVersion
    data = models.Ver(Op = op)
    data.save()


def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def loadFromSQL():
    global serverVersion
    global op
    for entry in models.Ver.objects.all():
        op_str = entry.Op
        op_list = ast.literal_eval(op_str)
        op.append(op_list)
        serverVersion += 1


def dealData(data):
    data_str = ""
    for item in data:
        if item['type'] == "ins":
            data_str += item['text'][0]
    return data_str



