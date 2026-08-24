from django.shortcuts import render, redirect
from django.http import JsonResponse
from django.views.decorators.http import require_POST
from .models import Outlet, MenuCategory, MenuItem, ComboMeal, ReservationInquiry, PromoVideo
from .forms import ReservationForm

def global_outlets_context(request):
    return {
        'all_outlets': Outlet.objects.filter(is_active=True).order_by('order_priority'),
        'current_path': request.path,

    }

def home_view(request):
    categories = MenuCategory.objects.filter(
        is_active=True
    ).prefetch_related('items')

    # Homepage shows only featured/bestseller items by default — full menu lives on /menu/
    menu_items = MenuItem.objects.filter(
        is_available=True, is_bestseller=True
    ).select_related('category')

    combos = ComboMeal.objects.filter(
        is_active=True
    )[:4]

    outlets = Outlet.objects.filter(
        is_active=True
    ).order_by('order_priority')

    promo_video = (
        PromoVideo.objects
        .filter(page='home', is_active=True)
        .order_by('-uploaded_at')
        .first()
    )

    context = {
        'categories': categories,
        'menu_items': menu_items,
        'combos': combos,
        'outlets': outlets,
        'promo_video': promo_video,
    }

    return render(request, 'index.html', context)

def menu_view(request):
    categories = MenuCategory.objects.filter(is_active=True).prefetch_related('items')
    # Initial load (before any tab/search interaction) shows featured items only
    menu_items = MenuItem.objects.filter(is_available=True, is_bestseller=True).select_related('category')
    promo_video = (
        PromoVideo.objects
        .filter(page='menu', is_active=True)
        .order_by('-uploaded_at')
        .first()
    )
    return render(request, 'menu.html', {
        'categories': categories,
        'menu_items': menu_items,
        'promo_video': promo_video,
    })

def combos_view(request):
    combos = ComboMeal.objects.filter(is_active=True)
    promo_video = (
        PromoVideo.objects
        .filter(page='combos', is_active=True)
        .order_by('-uploaded_at')
        .first()
    )
    return render(request, 'combos.html', {
        'combos': combos,
        'promo_video': promo_video,
    })

def outlets_view(request):
    outlets = Outlet.objects.filter(is_active=True)
    return render(request, 'outlets.html', {'outlets': outlets})

def about_view(request):
    return render(request, 'about.html')

def api_menu_items(request):
    category_slug = request.GET.get('category', 'all')
    search_query = request.GET.get('q', '').strip()
    show_all = request.GET.get('show_all', '') == '1'

    items = MenuItem.objects.filter(is_available=True).select_related('category')

    if category_slug != 'all':
        # A specific category was picked — show everything in it (e.g. all 200 snacks)
        items = items.filter(category__slug=category_slug)
    elif not search_query and not show_all:
        # "All Specialties" with no search and no explicit "show all" — featured only
        items = items.filter(is_bestseller=True)

    if search_query:
        items = items.filter(name__icontains=search_query) | items.filter(description__icontains=search_query)

    data = []
    for item in items:
        data.append({
            'id': item.id,
            'name': item.name,
            'category': item.category.name,
            'category_slug': item.category.slug,
            'price': str(item.price),
            'portion': item.portion_info,
            'desc': item.description,
            'image': item.display_image(),
            'is_veg': item.is_veg,
            'is_bestseller': item.is_bestseller,
            'spice': item.spice_level,
        })
    return JsonResponse({'items': data})

@require_POST
def submit_reservation(request):
    form = ReservationForm(request.POST)
    if form.is_valid():
        inquiry = form.save()
        msg = f"*CHAI GRILL BOOKING*%0A*Name:* {inquiry.full_name}%0A*Phone:* {inquiry.phone_number}%0A*Branch:* {inquiry.outlet.name}%0A*Date/Time:* {inquiry.booking_time}%0A*Guests:* {inquiry.guests_count}%0A*Notes:* {inquiry.special_notes or 'None'}"
        whatsapp_url = f"https://wa.me/{inquiry.outlet.whatsapp_number}?text={msg}"
        return redirect(whatsapp_url)
    return redirect('home')