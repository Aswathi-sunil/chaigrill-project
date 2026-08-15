from django.contrib import admin
from django.utils.html import format_html
from .models import Outlet, MenuCategory, MenuItem, ComboMeal, ReservationInquiry

@admin.register(Outlet)
class OutletAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'whatsapp_number', 'opening_time', 'is_active', 'order_priority')
    list_editable = ('is_active', 'order_priority')
    search_fields = ('name', 'area', 'phone')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MenuCategory)
class MenuCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'display_order', 'icon_class', 'is_active')
    list_editable = ('display_order', 'is_active')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(MenuItem)
class MenuItemAdmin(admin.ModelAdmin):
    list_display = ('name', 'category', 'price', 'portion_info', 'is_veg', 'is_bestseller', 'is_available', 'preview')
    list_filter = ('category', 'is_veg', 'is_bestseller', 'is_chef_special', 'is_available')
    list_editable = ('price', 'is_available', 'is_bestseller')
    search_fields = ('name', 'description')
    prepopulated_fields = {'slug': ('name',)}
    fields = (
        'category', 'name', 'slug', 'price', 'portion_info', 'description',
        'image', 'image_url', 'is_veg', 'is_bestseller', 'is_chef_special',
        'spice_level', 'is_available',
    )

    def preview(self, obj):
        url = obj.display_image()
        if url:
            return format_html('<img src="{}" style="width: 40px; height: 35px; border-radius: 4px; object-fit: cover;" />', url)
        return "-"

@admin.register(ComboMeal)
class ComboMealAdmin(admin.ModelAdmin):
    list_display = ('name', 'price', 'target_audience', 'badge', 'is_active', 'order_priority')
    list_editable = ('price', 'is_active', 'order_priority')
    prepopulated_fields = {'slug': ('name',)}


@admin.register(ReservationInquiry)
class ReservationInquiryAdmin(admin.ModelAdmin):
    list_display = ('full_name', 'phone_number', 'outlet', 'booking_time', 'guests_count', 'status', 'whatsapp_btn')
    list_filter = ('outlet', 'status', 'created_at')
    list_editable = ('status',)

    def whatsapp_btn(self, obj):
        msg = f"Hi {obj.full_name}, regarding your Chai Grill reservation at {obj.outlet.name}."
        url = f"https://wa.me/{obj.phone_number.replace('+', '').replace(' ', '')}?text={msg}"
        return format_html('<a href="{}" target="_blank" style="background:#25D366; color:white; padding:3px 8px; border-radius:4px; font-weight:bold; text-decoration:none;">WhatsApp</a>', url)
    whatsapp_btn.short_description = "Quick Contact"