"""finalProject651 URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.8/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Add an import:  from blog import urls as blog_urls
    2. Add a URL to urlpatterns:  url(r'^blog/', include(blog_urls))
    为了建立映射,我们用到了tuple.在Django里必须用urlpatterns来命名这个元组.
    这个urlpatterns元组包含一些django.conf.urls.url()函数的调用,而每个函数里都有一个唯一的映射.
    在上面的代码里,我们只用了url()一次,所以我们只映射了一个URL.django.conf.urls.url()
    函数的第一个参数是正则表达式^$,指的是匹配一个空字符串.所有匹配这个模式的URL都会映射到views.index()这个视图.
    用户的请求信息会包含在HttpRequest对象里作为参数传递给视图.我们给url()函数可选参数name赋值为index.
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.conf import settings
from django.conf.urls.static import static
from Editor import views

urlpatterns = [
    url(r'^$', views.index, name='index'),
    url(r'^add_string/$', views.addString, name='add_string'),
    url(r'^admin/', admin.site.urls),
]

