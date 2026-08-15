import os
from pathlib import Path
from django.core.files import File
from django.core.management.base import BaseCommand
from django.utils.text import slugify
from django.conf import settings
from core.models import MenuCategory, MenuItem

SEED_ASSETS_DIR = Path(settings.BASE_DIR) / "seed_assets"
VALID_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


def get_local_images(subfolder):
    """Return a sorted list of image file paths inside seed_assets/<subfolder>/."""
    folder = SEED_ASSETS_DIR / subfolder
    if not folder.exists():
        return []
    return sorted([p for p in folder.iterdir() if p.suffix.lower() in VALID_EXTS])


def attach_local_image(item, image_paths, index):
    """Copy a local image file into MEDIA_ROOT and assign it to the item's ImageField.
    Cycles through whatever images are available in that speciality's folder."""
    if not image_paths:
        return
    src_path = image_paths[index % len(image_paths)]
    with open(src_path, "rb") as f:
        target_name = f"{item.slug}{src_path.suffix.lower()}"
        item.image.save(target_name, File(f), save=True)


class Command(BaseCommand):
    help = "Seeds the 3 Chai's Grill specialities: Malabar Tea, Avil Milk, and Malabar Snacks"

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding Chai's Grill Speciality Collections...")

        # ------------------------------------------------------------------
        # 1. CATEGORIES
        # ------------------------------------------------------------------
        categories_data = [
            {"name": "Malabar Tea Lounge", "slug": "malabar-tea", "display_order": 20, "icon_class": "fa-mug-hot"},
            {"name": "Signature Avil Milk", "slug": "avil-milk", "display_order": 21, "icon_class": "fa-blender"},
            {"name": "Malabar Snacks Corner", "slug": "malabar-snacks", "display_order": 22, "icon_class": "fa-bowl-food"},
        ]
        cat_objs = {}
        for c in categories_data:
            cat_obj, _ = MenuCategory.objects.update_or_create(
                slug=c["slug"],
                defaults={"name": c["name"], "display_order": c["display_order"], "icon_class": c["icon_class"], "is_active": True}
            )
            cat_objs[c["slug"]] = cat_obj

        tea_images = get_local_images("tea")
        avil_images = get_local_images("avil_milk")
        snack_images = get_local_images("snacks")

        if not tea_images:
            self.stdout.write(self.style.WARNING("  ! No images found in seed_assets/tea/ — items will save without a photo."))
        if not avil_images:
            self.stdout.write(self.style.WARNING("  ! No images found in seed_assets/avil_milk/ — items will save without a photo."))
        if not snack_images:
            self.stdout.write(self.style.WARNING("  ! No images found in seed_assets/snacks/ — items will save without a photo."))

        # ------------------------------------------------------------------
        # 2. MALABAR TEA LOUNGE  (21 varieties)
        # ------------------------------------------------------------------
        teas = [
            ("Suleimani Chai", 30, "Smoky black tea with lemon, spices and a hint of jaggery."),
            ("Kerala Chukku Kaapi", 35, "Traditional dry-ginger and pepper decoction, brewed strong."),
            ("Royal Saffron Dum Chai", 45, "Slow-brewed Assam leaves with pure Kashmiri saffron and cardamom."),
            ("Cardamom Elaichi Chai", 30, "Classic milk tea infused with crushed green cardamom."),
            ("Ginger Adrak Chai", 30, "Bold milk tea with freshly pounded ginger."),
            ("Malabar Masala Chai", 35, "Five-spice blend chai simmered the traditional dum way."),
            ("Kashmiri Kahwa", 50, "Fragrant green tea with saffron, almonds and rose petals."),
            ("Gulab Rose Chai", 40, "Delicate rose-infused milk tea with a floral finish."),
            ("Pudina Mint Chai", 35, "Refreshing mint leaves steeped into classic dum chai."),
            ("Lemongrass Chai", 35, "Citrusy lemongrass brewed with black tea leaves."),
            ("Tulsi Herbal Chai", 35, "Holy basil leaves for a soothing, aromatic cup."),
            ("Nannari Chai", 40, "Sarsaparilla root infused chai with a cooling aftertaste."),
            ("Kannan Devan Black Tea", 25, "Pure high-range Munnar estate black tea, no milk."),
            ("Munnar Green Tea", 30, "Light and antioxidant-rich green tea from the hills."),
            ("Vellai Poo Jasmine Chai", 45, "White tea gently scented with jasmine blossoms."),
            ("Panneer Rose Milk Chai", 45, "Rose milk swirled into a rich, creamy dum chai."),
            ("Irani Chai", 40, "Kerala-style Irani chai, thick, sweet and malai-topped."),
            ("Dalchini Cinnamon Chai", 35, "Warming cinnamon bark simmered into milk tea."),
            ("Karayampoo Clove Chai", 35, "Clove-forward spiced tea for cold evenings."),
            ("Honey Suleimani Special", 40, "Suleimani chai sweetened naturally with forest honey."),
            ("Chai Grill Signature Dum Chai", 50, "Our house-blend dum chai — the one that started it all."),
        ]
        for i, (name, price, desc) in enumerate(teas):
            item, _ = MenuItem.objects.update_or_create(
                slug=slugify(name),
                defaults={
                    "category": cat_objs["malabar-tea"],
                    "name": name,
                    "price": price,
                    "portion_info": "Kulhad / Clay Cup",
                    "description": desc,
                    "is_veg": True,
                    "is_bestseller": name in (
                        "Royal Saffron Dum Chai", "Chai Grill Signature Dum Chai",
                        "Kerala Chukku Kaapi", "Kashmiri Kahwa"
                    ),
                    "spice_level": 0,
                    "is_available": True,
                }
            )
            attach_local_image(item, tea_images, i)
        self.stdout.write(self.style.SUCCESS(f"  ✓ {len(teas)} Malabar Tea items seeded"))

        # ------------------------------------------------------------------
        # 3. SIGNATURE AVIL MILK  (60 flavours)
        # ------------------------------------------------------------------
        standard_flavours = [
            "Classic Original", "Banana", "Mango", "Strawberry", "Pineapple", "Papaya",
            "Watermelon", "Litchi", "Black Grapes", "Guava", "Orange", "Chikoo",
            "Custard Apple", "Jackfruit", "Pomegranate", "Blueberry", "Blackberry",
            "Black Currant", "Fig (Anjeer)", "Mixed Fruit Punch", "Coconut Malai",
            "Ginger Spice", "Cinnamon Spice", "Cardamom (Elaichi)", "Nannari",
            "Rose Milk Special", "Falooda Special", "Kulfi Style", "Malai Special",
            "Honey & Dates",
        ]
        premium_flavours = [
            "Chocolate", "Cold Coffee", "Cocoa Delight", "French Vanilla", "Butterscotch",
            "Caramel Swirl", "Red Velvet", "Cookies & Cream", "Bubblegum Blast",
            "Mint Choco Chip", "Coffee Caramel", "Choco Almond", "Oreo Crunch",
            "KitKat Crush", "Ferrero Rocher", "Nutella Fusion", "Biscoff Crunch",
            "Pista (Pistachio)", "Badam (Almond)", "Badam Pista Royal", "Kesar (Saffron)",
            "Kesar Pista Royal", "Pesta Rose Royal", "Elaichi Kesar Special",
            "Mixed Dry Fruits", "Honey Almond", "Walnut Honey", "Cashew Delight",
            "Anjeer Dry Fruit Blend", "Chai Grill Signature Avil Special",
        ]
        avil_flavours = [(f, 75, False) for f in standard_flavours] + [(f, 130, True) for f in premium_flavours]

        for i, (flavour, price, premium) in enumerate(avil_flavours):
            name = f"{flavour} Avil Milk"
            item, _ = MenuItem.objects.update_or_create(
                slug=slugify(name),
                defaults={
                    "category": cat_objs["avil-milk"],
                    "name": name,
                    "price": price,
                    "portion_info": "Chilled Tall Glass",
                    "description": f"Our beloved hand-tossed beaten-rice (avil) milk speciality in {flavour.lower()} flavour.",
                    "is_veg": True,
                    "is_bestseller": flavour in (
                        "Classic Original", "Rose Milk Special", "Nannari",
                        "Ferrero Rocher", "Chai Grill Signature Avil Special"
                    ),
                    "spice_level": 0,
                    "is_available": True,
                }
            )
            attach_local_image(item, avil_images, i)
        self.stdout.write(self.style.SUCCESS(f"  ✓ {len(avil_flavours)} Avil Milk items seeded"))

        # ------------------------------------------------------------------
        # 4. MALABAR SNACKS CORNER  (50 base recipes x 4 styles = 200 items)
        # ------------------------------------------------------------------
        base_snacks = [
            ("Unniyappam", 60, True, "Sweet jaggery-and-banana rice fritters, deep-fried golden."),
            ("Achappam (Rose Cookies)", 70, True, "Crisp rice-flour rosettes fried in coconut oil."),
            ("Kuzhalappam", 60, True, "Crunchy rolled rice-coconut tubes, lightly savoury."),
            ("Kozhukatta", 65, True, "Steamed rice dumplings filled with jaggery and coconut."),
            ("Ela Ada", 65, True, "Steamed rice cakes wrapped in banana leaf with jaggery filling."),
            ("Neyyappam", 65, True, "Ghee-fried sweet rice-jaggery fritters."),
            ("Pazham Pori", 55, True, "Golden banana fritters dipped in sweet batter."),
            ("Uzhunnu Vada", 45, True, "Crispy black-gram lentil doughnuts, fluffy inside."),
            ("Parippu Vada", 40, True, "Crunchy split-lentil fritters with curry leaves."),
            ("Veg Bonda", 40, True, "Spiced potato filling coated in gram-flour batter."),
            ("Sukhiyan", 50, True, "Sweet mung-jaggery balls wrapped in crisp batter."),
            ("Veg Cutlet", 55, True, "Spiced vegetable and potato patties, crumb fried."),
            ("Chicken Cutlet", 75, False, "Shredded spiced chicken patties, crumb fried golden."),
            ("Beef Cutlet", 85, False, "Malabar-style minced beef patties, deep fried."),
            ("Fish Cutlet", 80, False, "Flaked fish and potato patties in a crisp coating."),
            ("Egg Puffs", 45, False, "Flaky pastry parcels with spiced boiled egg filling."),
            ("Chicken Puffs", 55, False, "Flaky pastry parcels with spiced shredded chicken."),
            ("Veg Puffs", 40, True, "Flaky pastry parcels with a spiced vegetable filling."),
            ("Veg Samosa", 40, True, "Crisp pastry triangles filled with spiced potato peas."),
            ("Chicken Samosa", 55, False, "Crisp pastry triangles filled with minced spiced chicken."),
            ("Mutta (Egg) Samosa", 45, False, "Crisp pastry triangles filled with spiced boiled egg."),
            ("Kai Bonda", 45, True, "Banana-stuffed gram flour fritters, a Malabar tea-time classic."),
            ("Chicken 65", 130, False, "Deep-fried chicken bites tossed in a fiery Malabar masala."),
            ("Chilly Chicken Bites", 130, False, "Wok-tossed chicken bites in a spicy chilli glaze."),
            ("Pepper Chicken Bites", 135, False, "Crushed black pepper coated crispy chicken bites."),
            ("Chicken Lollipop", 150, False, "Frenched chicken wings, deep fried and sauce-tossed."),
            ("Malabar Fish Fry", 140, False, "Kerala-style spiced and shallow-fried fish steaks."),
            ("Prawn Fry", 160, False, "Marinated prawns shallow-fried in Malabar spices."),
            ("Squid Fry (Koonthal)", 150, False, "Tender calamari rings tossed in a spicy masala coat."),
            ("Beef Ularthiyathu Bites", 170, False, "Slow-roasted spiced beef bites, coconut-flecked."),
            ("Kappa Vada", 45, True, "Tapioca and spice fritters, a Malabar tea-shop favourite."),
            ("Banana Chips", 50, True, "Thin-sliced Nendran banana, fried crisp in coconut oil."),
            ("Jackfruit Chips", 60, True, "Crunchy chakka chips fried in traditional coconut oil."),
            ("Tapioca Chips", 50, True, "Crispy kappa chips, lightly salted."),
            ("Sharkara Varatti", 65, True, "Jaggery-coated banana chips, sweet and crunchy."),
            ("Achinga Payar Vada", 45, True, "Long-bean and lentil fritters with a peppery bite."),
            ("Masala Peanuts", 40, True, "Crunchy gram-flour coated roasted peanuts."),
            ("Roasted Cashew Masala", 90, True, "Kerala cashews roasted with curry leaves and spices."),
            ("Egg Roll", 55, False, "Spiced omelette rolled in a soft paratha wrap."),
            ("Chicken Roll", 70, False, "Shredded spiced chicken rolled in a soft paratha wrap."),
            ("Mutton Roll", 90, False, "Slow-cooked spiced mutton rolled in a soft paratha wrap."),
            ("Chatti Pathiri Bites", 75, False, "Layered pastry bites with a spiced chicken filling."),
            ("Mutta Mala", 55, False, "Sweet egg-yolk syrup threads, a festive Malabar delicacy."),
            ("Kalthappam", 60, True, "Steamed rice-jaggery cake baked in an earthen pot."),
            ("Elayappam", 55, True, "Steamed rice cakes in banana leaf, coconut-jaggery filled."),
            ("Manda Pathiri", 55, True, "Soft layered rice-flour crepes, served with sweet coconut."),
            ("Kinnathappam", 55, True, "Steamed rice-coconut pudding cake, subtly sweet."),
            ("Diamond Cuts", 45, True, "Crisp sweet maida diamonds, deep fried golden."),
            ("Pathiri Chips", 45, True, "Thin rice pathiri, fried into crunchy chips."),
            ("Nool Appam Bites", 60, True, "Steamed rice-noodle cakes, served bite-sized with stew."),
        ]

        styles = [
            ("Classic", 1.0, "Standard Plate (4-5 pcs)", "Served in our classic traditional style."),
            ("Spicy Masala Twist", 1.15, "Spicy Twist Plate", "Tossed in an extra-fiery Malabar masala coating."),
            ("Family Pack", 4.3, "Family Pack (Serves 4-5)", "A generous sharing portion for the whole table."),
            ("Party Box", 7.8, "Party Box (Serves 8-10)", "Our biggest party-ready box for large gatherings."),
        ]

        snack_count = 0
        for s_idx, (base_name, base_price, is_veg, base_desc) in enumerate(base_snacks):
            for style_name, multiplier, portion, style_desc in styles:
                name = f"{base_name} - {style_name}"
                price = round((base_price * multiplier) / 5) * 5
                item, _ = MenuItem.objects.update_or_create(
                    slug=slugify(name),
                    defaults={
                        "category": cat_objs["malabar-snacks"],
                        "name": name,
                        "price": price,
                        "portion_info": portion,
                        "description": f"{base_desc} {style_desc}",
                        "is_veg": is_veg,
                        "is_bestseller": style_name == "Classic" and base_name in (
                            "Unniyappam", "Pazham Pori", "Chicken 65", "Kuzhalappam",
                            "Parippu Vada", "Malabar Fish Fry", "Chicken Cutlet", "Banana Chips"
                        ),
                        "spice_level": 2 if style_name == "Spicy Masala Twist" else 1,
                        "is_available": True,
                    }
                )
                attach_local_image(item, snack_images, s_idx)
                snack_count += 1

        self.stdout.write(self.style.SUCCESS(f"  ✓ {snack_count} Malabar Snacks items seeded"))
        self.stdout.write(self.style.SUCCESS("Speciality collections seeded successfully!"))