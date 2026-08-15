from django.urls import path
from . import views

urlpatterns = [
    path('', views.home_view, name='home'),
    path('menu/', views.menu_view, name='menu'),
    path('combos/', views.combos_view, name='combos'),
    path('outlets/', views.outlets_view, name='outlets'),
    path('about/', views.about_view, name='about'),
    path('api/menu/', views.api_menu_items, name='api_menu_items'),
    path('reserve/', views.submit_reservation, name='submit_reservation'),
]