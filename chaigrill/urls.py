from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

admin.site.site_header = "Chai Grill Luxury Master Admin"
admin.site.site_title = "Chai Grill Management"
admin.site.index_title = "Chain Operations & Outlets"

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('core.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)