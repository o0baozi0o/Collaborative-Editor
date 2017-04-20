import json
from django.shortcuts import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from Editor import models
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import render
from django.http import JsonResponse

# 在views.py文件里每个视图对应一个单独的函数.在这个例子中我们只创建了一个index视图.


# 每个视图至少带一个参数 - 一个在django.http模块的HttpRequest对象.
# 每个视图都要返回一个HttpResponse对象.本例中这个HttpResponse对象把一个字符串当做参数传递给客户端.
# 虽然已经创建了视图,但是如果想让别人看到它,你必须用URL映射这个视图.

@csrf_exempt
def index(request):
    title = {'title': "Welcome to the Editor"}
    return render(request, 'editor/index.html', title)

@csrf_exempt
def addString(request):
    print("[Server]HTTP Request Type: " + request.method)
    if request.method == 'POST':
        ip = get_client_ip(request)
        print("[Server]From Client:" + ip)
        data = request.POST.get('string')
        try:
            file_value = models.File.objects.get(Line = 4)
        except ObjectDoesNotExist:
            data = models.File(String = data)
            #print(data.String)
            #print(data.Line)
            data.save()
            return JsonResponse({"content": "Line Created"})
        file_value.String += data
        file_value.save()
        print("[Server Reply]Yes")
        # Retrieving the value.
        return JsonResponse({"content": file_value.String})
    else:
        return HttpResponse("[Server Reply]NONONO")

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip