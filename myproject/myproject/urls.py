"""
URL configuration for myproject project.

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/4.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path, include
from myapp.views import run_script_view, run_student_view, home, create_item, edit_item, edit_tags, add_student

urlpatterns = [
    path('admin/', admin.site.urls),
    path('inventory/', run_script_view, name='run_script'),
    path('students/', run_student_view, name='run_script'),
    path('', home, name='run_script'),
    path('inventory/create-item/', create_item),
    path('inventory/edit-item/', edit_item),
    path('inventory/edit-tags/', edit_tags),
    path('students/add-student/', add_student),
]
