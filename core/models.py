from django.db import models
from django.utils.text import slugify
from cloudinary_storage.storage import VideoMediaCloudinaryStorage

def generate_unique_slug(model_instance, field_value, slug_field_name="slug"):
    """Generates a guaranteed unique slug even if duplicates exist."""
    base_slug = slugify(field_value) or "item"
    unique_slug = base_slug
    extension = 1
    ModelClass = model_instance.__class__

    while ModelClass.objects.filter(**{slug_field_name: unique_slug}).exclude(pk=model_instance.pk).exists():
        unique_slug = f"{base_slug}-{extension}"
        extension += 1
    return unique_slug


class Outlet(models.Model):
    name = models.CharField(max_length=150, help_text="e.g. Thoppumpady, Kochi")
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    area = models.CharField(max_length=120, help_text="e.g. Big Building, 30-19/C16, Thoppumpady")
    phone = models.CharField(max_length=20, help_text="e.g. 8943777001")
    whatsapp_number = models.CharField(max_length=20, help_text="e.g. 918943777001")
    email = models.EmailField(default="chaisgrills@gmail.com")
    opening_time = models.CharField(max_length=50, default="4:00 PM – 2:00 AM")
    google_maps_url = models.URLField(blank=True, null=True)
    image_url = models.URLField(blank=True,
                                default="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80")
    order_priority = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order_priority']
        verbose_name = "Outlet / Branch"
        verbose_name_plural = "Outlets / Branches"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.name} - {self.phone}"


class MenuCategory(models.Model):
    name = models.CharField(max_length=100)
    slug = models.SlugField(max_length=120, unique=True, blank=True)
    icon_class = models.CharField(max_length=50, default="fa-fire", help_text="FontAwesome icon class")
    display_order = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['display_order']
        verbose_name_plural = "Menu Categories"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class MenuItem(models.Model):
    category = models.ForeignKey(MenuCategory, on_delete=models.CASCADE, related_name="items")
    name = models.CharField(max_length=160)
    slug = models.SlugField(max_length=180, unique=True, blank=True)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    portion_info = models.CharField(max_length=120, blank=True,
                                    help_text="e.g. 4PS / 8PS, Full / Half / Qtr, + Fries & Mayo")
    description = models.TextField(blank=True)

    image = models.ImageField(
        upload_to="menu_items/%Y/%m/",
        blank=True,
        null=True,
        help_text="Upload a photo directly from your device (recommended). Takes priority over the Image URL below."
    )
    image_url = models.URLField(max_length=500, blank=True,
                                help_text="Only used if no image is uploaded above (e.g. an external/Unsplash link).")

    is_veg = models.BooleanField(default=False)
    is_bestseller = models.BooleanField(default=False)
    is_chef_special = models.BooleanField(default=False)
    spice_level = models.PositiveSmallIntegerField(default=1, choices=[(0, "Mild"), (1, "Medium"), (2, "Spicy"),
                                                                       (3, "Extra Fiery")])
    is_available = models.BooleanField(default=True)

    class Meta:
        ordering = ['-is_bestseller', 'name']

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def display_image(self):
        if self.image:
            return self.image.url
        return self.image_url or ""

    def __str__(self):
        return f"{self.name} - ₹{self.price}"

class ComboMeal(models.Model):
    name = models.CharField(max_length=150, help_text="e.g. Best Bucket, Jolley Meal, Family Combo")
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    price = models.DecimalField(max_digits=7, decimal_places=2)
    target_audience = models.CharField(max_length=120, blank=True)
    includes = models.TextField(help_text="Items separated by commas")
    badge = models.CharField(max_length=50, blank=True, default="POPULAR COMBO")
    image_url = models.URLField(max_length=500, blank=True)
    order_priority = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['order_priority']
        verbose_name = "Combo / Bucket Deal"
        verbose_name_plural = "Combos & Bucket Deals"

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def get_includes_list(self):
        return [i.strip() for i in self.includes.split(",") if i.strip()]

    def __str__(self):
        return f"{self.name} - ₹{self.price}"


class PromoVideo(models.Model):
    """A short floating promo video shown as a corner widget on the site.
    Upload the video file from the Django admin — only the most recent
    active one is displayed."""
    PAGE_CHOICES = [
        ('home','Home'),
        ('menu','Menu'),
        ('combos','Loaded Combos'),
    ]
    title = models.CharField(max_length=150, help_text="Internal label, e.g. 'Cocktail Pour Reel'")
    video = models.FileField(
        upload_to="promo_videos/%Y/%m/",
        storage=VideoMediaCloudinaryStorage(),
        help_text="Upload an MP4 file (keep it short, under ~15MB for fast loading)."
    )
    thumbnail = models.ImageField(
        upload_to="promo_videos/thumbs/%Y/%m/",
        blank=True, null=True,
        help_text="Optional poster image shown before the video plays."
    )
    link_url = models.URLField(
        blank=True,
        help_text="Optional — where the widget takes users if they tap the expand icon."
    )
    is_active = models.BooleanField(default=True)
    page = models.CharField(max_length=20, choices=PAGE_CHOICES, default='home')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']
        verbose_name = "Floating Promo Video"
        verbose_name_plural = "Floating Promo Videos"

    def __str__(self):
        return self.title

class ReservationInquiry(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending Review'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
    ]

    full_name = models.CharField(max_length=150)
    phone_number = models.CharField(max_length=20)
    outlet = models.ForeignKey(Outlet, on_delete=models.CASCADE, related_name="inquiries")
    booking_time = models.DateTimeField()
    guests_count = models.PositiveIntegerField(default=2)
    special_notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']
        verbose_name = "Reservation / Inquiry"
        verbose_name_plural = "Reservations & Inquiries"

    def __str__(self):
        return f"{self.full_name} ({self.outlet.name})"