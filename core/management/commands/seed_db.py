from django.core.management.base import BaseCommand
from django.utils.text import slugify
from core.models import Outlet, MenuCategory, MenuItem, ComboMeal

class Command(BaseCommand):
    help = 'Safely seeds/updates all 4 Kochi Outlets, Official Menu Items, and Combos'

    def handle(self, *args, **kwargs):
        self.stdout.write("Seeding/Updating Chai Grill Database...")

        # 1. Outlets
        outlets = [
            {"name": "Thoppumpady, Kochi", "area": "Big Building, 30-19/C16, Thoppumpady, Kochi, Kerala 682005", "phone": "8943777001", "whatsapp_number": "918943777001", "order_priority": 1},
            {"name": "Padamughal, Kakkanad", "area": "Near Civil Station, Padamughal, Kakkanad", "phone": "9747478292", "whatsapp_number": "919747478292", "order_priority": 2},
            {"name": "Changampuzha Park, Edappally", "area": "Opposite Changampuzha Park, Edappally, Kochi", "phone": "9747478092", "whatsapp_number": "919747478092", "order_priority": 3},
            {"name": "Willingdon Island, Mattancheri", "area": "Mattancheri Halt, Willingdon Island, Kochi", "phone": "8943777001", "whatsapp_number": "918943777001", "order_priority": 4},
        ]
        for o in outlets:
            slug = slugify(o["name"])
            Outlet.objects.update_or_create(slug=slug, defaults=o)

        # 2. Categories
        categories_data = [
            {"name": "Shawaya & Mandhi", "slug": "shawaya-mandhi", "display_order": 1, "icon_class": "fa-fire"},
            {"name": "Crispy Fried Chicken", "slug": "crispy-fried-chicken", "display_order": 2, "icon_class": "fa-drumstick-bite"},
            {"name": "Golden Bites & Wings", "slug": "golden-bites-wings", "display_order": 3, "icon_class": "fa-bowl-food"},
            {"name": "Shawarma & Rolls", "slug": "shawarma-rolls", "display_order": 4, "icon_class": "fa-bread-slice"},
            {"name": "Burgers & Wraps", "slug": "burgers-wraps", "display_order": 5, "icon_class": "fa-burger"},
            {"name": "Mojitos, Shakes & Chai", "slug": "mojitos-shakes-chai", "display_order": 6, "icon_class": "fa-mug-hot"},
        ]

        cat_objs = {}
        for c in categories_data:
            cat_obj, _ = MenuCategory.objects.update_or_create(
                slug=c["slug"],
                defaults={"name": c["name"], "display_order": c["display_order"], "icon_class": c["icon_class"], "is_active": True}
            )
            cat_objs[c["slug"]] = cat_obj

        # 3. Menu Items
        items = [
            # Shawaya & Mandhi
            {"cat_slug": "shawaya-mandhi", "name": "Shawaya Mandhi (Full)", "price": 899.00, "portion_info": "4 Person Feast", "description": "Authentic fragrant Mandhi rice served with full succulent Shawaya chicken, spicy chutneys, garlic dip & salads.", "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", "is_bestseller": True, "spice_level": 2},
            {"cat_slug": "shawaya-mandhi", "name": "Shawaya Mandhi (Half)", "price": 459.00, "portion_info": "2 Person", "description": "Aromatic Mandhi rice served with half grilled Shawaya chicken and sides.", "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", "is_bestseller": True, "spice_level": 2},
            {"cat_slug": "shawaya-mandhi", "name": "Shawaya Mandhi (Quarter)", "price": 239.00, "portion_info": "1 Person", "description": "Single portion Mandhi rice with quarter grilled chicken.", "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", "spice_level": 1},
            {"cat_slug": "shawaya-mandhi", "name": "Masala Shawaya Full", "price": 679.00, "portion_info": "4 Kubz + 4 Ketchup + Mayo (L) + Salad", "description": "Whole grilled chicken coated in robust roasted Kerala-Arabian masala.", "image_url": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80", "is_bestseller": True, "spice_level": 3},
            {"cat_slug": "shawaya-mandhi", "name": "Pepper Shawaya Full", "price": 699.00, "portion_info": "4 Kubz + 4 Ketchup + Mayo (L) + Salad", "description": "Charcoal grilled with crushed black Malabar peppercorn marinade.", "image_url": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80", "spice_level": 3},
            {"cat_slug": "shawaya-mandhi", "name": "Honey Chillie Shawaya Full", "price": 699.00, "portion_info": "4 Kubz + Mayo + Salad", "description": "Sweet honey glaze infused with spicy red chilies on flame grill.", "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80", "spice_level": 2},
            {"cat_slug": "shawaya-mandhi", "name": "Creamy Shawaya Full", "price": 749.00, "portion_info": "4 Kubz + Mayo + Salad", "description": "Rich velvet creamy marinated grilled chicken.", "image_url": "https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80", "spice_level": 1},

            # Crispy Fried Chicken
            {"cat_slug": "crispy-fried-chicken", "name": "Crispy Fried Chicken (4PS)", "price": 279.00, "portion_info": "2 Bun + Ketchup + 2 Mayo (S)", "description": "Golden double-dredged crunchy fried chicken pieces.", "image_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80", "is_bestseller": True},
            {"cat_slug": "crispy-fried-chicken", "name": "Crispy Fried Chicken (8PS)", "price": 529.00, "portion_info": "4 Bun + Ketchup + 3 Mayo (M)", "description": "Family pack ultra crispy golden chicken.", "image_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=600&q=80", "is_bestseller": True},
            {"cat_slug": "crispy-fried-chicken", "name": "Don Chilly (10PS)", "price": 349.00, "portion_info": "1 Bun + Ketchup + Mayo (S)", "description": "Signature spicy glazed crunch poppers.", "image_url": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80", "spice_level": 3},
            {"cat_slug": "crispy-fried-chicken", "name": "Don Chilly (20PS)", "price": 639.00, "portion_info": "3 Bun + Ketchup + Mayo (L)", "description": "Large feast spicy crunch poppers.", "image_url": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=600&q=80", "spice_level": 3},

            # Golden Bites & Wings
            {"cat_slug": "golden-bites-wings", "name": "Peri Peri Wings (8PS)", "price": 219.00, "portion_info": "8 Pieces", "description": "Juicy chicken wings tossed in fiery African peri peri dust.", "image_url": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80", "spice_level": 3},
            {"cat_slug": "golden-bites-wings", "name": "BBQ Wings (8PS)", "price": 219.00, "portion_info": "8 Pieces", "description": "Smoky sweet hickory BBQ sauce glazed wings.", "image_url": "https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80", "spice_level": 1},
            {"cat_slug": "golden-bites-wings", "name": "Boneless Strips (8PS)", "price": 229.00, "portion_info": "8 Tender Strips", "description": "Crisp white meat chicken tenders.", "image_url": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=600&q=80"},
            {"cat_slug": "golden-bites-wings", "name": "Spicy Loaded Fries", "price": 169.00, "portion_info": "Generous Skillet", "description": "Golden fries doused in jalapeño cheese sauce, spice dust & garlic dip.", "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80", "is_veg": True, "spice_level": 2},

            # Shawarma
            {"cat_slug": "shawarma-rolls", "name": "Cheesy Rumali Shawarma", "price": 169.00, "portion_info": "Jumbo Roll", "description": "Rotisserie shaved chicken packed with melted cheddar and toum garlic sauce.", "image_url": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80", "is_bestseller": True},
            {"cat_slug": "shawarma-rolls", "name": "Full Meat Rumali Shawarma", "price": 179.00, "portion_info": "100% Pure Meat (No Veggies)", "description": "Packed solid with tender spiced chicken cuts.", "image_url": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80", "is_bestseller": True},
            {"cat_slug": "shawarma-rolls", "name": "Rocket Roll Shawarma", "price": 249.00, "portion_info": "Signature Extra Long", "description": "Double portion chicken with layered cheese and spicy salsa.", "image_url": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=600&q=80"},

            # Burgers & Wraps
            {"cat_slug": "burgers-wraps", "name": "Spicy Crunchy Burger", "price": 169.00, "portion_info": "Brioche Bun + Fries", "description": "Spicy fried chicken fillet with red-chili garlic glaze.", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", "spice_level": 3},
            {"cat_slug": "burgers-wraps", "name": "Loaded Chicken Burger", "price": 189.00, "portion_info": "Double Patty + Cheese", "description": "Stack of grilled and crispy patties with melted cheddar.", "image_url": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80", "is_bestseller": True},
            {"cat_slug": "burgers-wraps", "name": "Loaded Crispy Chicken Wrap", "price": 189.00, "portion_info": "Tortilla Wrap", "description": "Strips of crispy tenders rolled with pickles, cheese & mayo.", "image_url": "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=600&q=80"},

            # Beverages & Shakes
            {"cat_slug": "mojitos-shakes-chai", "name": "Blue Curraco Mojito", "price": 100.00, "portion_info": "Chilled Tall Glass", "description": "Crushed mint, fresh lime, blue curacao & sparkling soda.", "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", "is_veg": True},
            {"cat_slug": "mojitos-shakes-chai", "name": "Passion Fruit Mojito", "price": 100.00, "portion_info": "Chilled Tall Glass", "description": "Tropical passion fruit pulp with zesty mint.", "image_url": "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80", "is_veg": True},
            {"cat_slug": "mojitos-shakes-chai", "name": "Sharja Thick Shake", "price": 80.00, "portion_info": "Rich & Creamy", "description": "Kerala's beloved banana, milk & boosted malty shake.", "image_url": "https://images.unsplash.com/photo-1572490122747-3968b75cc699?auto=format&fit=crop&w=600&q=80", "is_veg": True, "is_bestseller": True},
            {"cat_slug": "mojitos-shakes-chai", "name": "Royal Saffron Dum Chai", "price": 40.00, "portion_info": "Clay Matka Cup", "description": "Slow-brewed Assam leaves with Kashmir saffron & crushed cardamom.", "image_url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80", "is_veg": True, "is_bestseller": True},
        ]

        for item_data in items:
            cat_slug = item_data.pop("cat_slug")
            item_slug = slugify(item_data["name"])
            MenuItem.objects.update_or_create(
                slug=item_slug,
                defaults={**item_data, "category": cat_objs[cat_slug], "is_available": True}
            )

        # 4. Combos
        combos = [
            {
                "name": "Best Bucket Deal",
                "price": 1849.00,
                "target_audience": "For 5-8 Hungry Legends",
                "badge": "ULTIMATE MEGA FEAST",
                "includes": "1 Full Shawaya Mandhi, 10PS Fried Chicken, 20PS Don Chilly, Loaded Fries (L), 2L Cola, Bun 4, Fresh Salad, 3 Mayo (L), Hot Chutney",
                "image_url": "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=800&q=80",
                "order_priority": 1,
            },
            {
                "name": "Jolley Meal",
                "price": 999.00,
                "target_audience": "For 3-4 People",
                "badge": "SUPER VALUE DEAL",
                "includes": "1/2 Shawaya Mandhi, 3PS Fried Chicken, 8PS Don Chilly, Fries (M), 2L Cola, Bun 2, Salad, Ketchup, Mayo",
                "image_url": "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=800&q=80",
                "order_priority": 2,
            },
            {
                "name": "Family Combo",
                "price": 699.00,
                "target_audience": "For Family of 3-4",
                "badge": "FAMILY SPECIAL",
                "includes": "7PS Fried Chicken, Large French Fries, 1L Cold Drink, 3 Soft Buns, Ketchup, 2 Mayo (L)",
                "image_url": "https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?auto=format&fit=crop&w=800&q=80",
                "order_priority": 3,
            },
            {
                "name": "Couple Combo",
                "price": 349.00,
                "target_audience": "For 2 Foodies",
                "badge": "COUPLE HIT",
                "includes": "2PS Crispy Chicken, Small Fries, 740ml Cold Drink, 2 Soft Buns, Ketchup, 2 Mayo (S)",
                "image_url": "https://images.unsplash.com/photo-1562967914-608f82629710?auto=format&fit=crop&w=800&q=80",
                "order_priority": 4,
            },
            {
                "name": "Evening Combo",
                "price": 199.00,
                "target_audience": "Evening Snack",
                "badge": "QUICK BITE",
                "includes": "1 Jumbo Rumali Shawarma Roll, 1 Sparkling Chilled Mojito of your choice",
                "image_url": "https://images.unsplash.com/photo-1529006557810-274b9b2fc783?auto=format&fit=crop&w=800&q=80",
                "order_priority": 5,
            },
            {
                "name": "Kidz Combo",
                "price": 99.00,
                "target_audience": "For Kids",
                "badge": "KIDS DELIGHT",
                "includes": "Crispy Chicken Piece, Ketchup, Mayo, Small Cold Drink",
                "image_url": "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=800&q=80",
                "order_priority": 6,
            },
        ]

        for c in combos:
            c_slug = slugify(c["name"])
            ComboMeal.objects.update_or_create(slug=c_slug, defaults={**c, "is_active": True})

        self.stdout.write(self.style.SUCCESS("All Outlets, Categories, Menu Items & Combos Seeded Successfully!"))