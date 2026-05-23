<?php

namespace App\Services\Api;

use App\Models\Category;
use App\Models\User;
use Illuminate\Support\Collection;

/**
 * Provisions the Nigerian-default category taxonomy described in
 * `margin_app/PRD.md` for a given user. Idempotent — categories already
 * matched by (user_id, name, type) are left alone.
 *
 * The taxonomy is intentionally flat here (no parent grouping) because
 * the Flutter client renders categories as a flat searchable list.
 */
class DefaultCategoryProvisioner
{
    /**
     * @return Collection<int, Category>
     */
    public function provision(User $user): Collection
    {
        $existing = Category::query()
            ->where('user_id', $user->id)
            ->get(['name', 'type'])
            ->mapWithKeys(fn (Category $c) => [strtolower($c->type.'|'.$c->name) => true]);

        $created = collect();
        $order = (int) (Category::query()->where('user_id', $user->id)->max('display_order') ?? 0);

        foreach (self::taxonomy() as $row) {
            $key = strtolower($row['type'].'|'.$row['name']);
            if ($existing->has($key)) {
                continue;
            }

            $order++;
            $created->push(Category::create([
                'user_id' => $user->id,
                'name' => $row['name'],
                'type' => $row['type'],
                'budget_category' => $row['budget_category'],
                'icon' => $row['icon'],
                'color' => $row['color'],
                'display_order' => $order,
                'is_active' => true,
            ]));
        }

        return $created;
    }

    /**
     * @return list<array{name: string, type: string, budget_category: ?string, icon: string, color: string}>
     */
    public static function taxonomy(): array
    {
        return [
            // Income
            ['name' => 'Salary', 'type' => 'income', 'budget_category' => null, 'icon' => 'work', 'color' => '#16a34a'],
            ['name' => 'Side Hustle', 'type' => 'income', 'budget_category' => null, 'icon' => 'business_center', 'color' => '#16a34a'],
            ['name' => 'Investment Returns', 'type' => 'income', 'budget_category' => null, 'icon' => 'trending_up', 'color' => '#16a34a'],
            ['name' => 'Business Income', 'type' => 'income', 'budget_category' => null, 'icon' => 'store', 'color' => '#16a34a'],
            ['name' => 'Gifts/Cash', 'type' => 'income', 'budget_category' => null, 'icon' => 'card_giftcard', 'color' => '#16a34a'],
            ['name' => 'Other Income', 'type' => 'income', 'budget_category' => null, 'icon' => 'paid', 'color' => '#16a34a'],

            // Housing — Needs
            ['name' => 'Rent', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'home', 'color' => '#ef4444'],
            ['name' => 'Estate/Service Charge', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'apartment', 'color' => '#ef4444'],
            ['name' => 'Generator Fuel/Diesel', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'local_gas_station', 'color' => '#ef4444'],
            ['name' => 'Electricity (NEPA/PHCN)', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'bolt', 'color' => '#ef4444'],
            ['name' => 'Water (Borehole/Tanker)', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'water_drop', 'color' => '#ef4444'],
            ['name' => 'Repairs & Maintenance', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'build', 'color' => '#ef4444'],

            // Transport — Needs
            ['name' => 'Fuel (Car)', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'local_gas_station', 'color' => '#f97316'],
            ['name' => 'Bolt/Uber', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'directions_car', 'color' => '#f97316'],
            ['name' => 'Danfo/BRT/Keke', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'directions_bus', 'color' => '#f97316'],
            ['name' => 'Car Maintenance', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'car_repair', 'color' => '#f97316'],
            ['name' => 'Parking', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'local_parking', 'color' => '#f97316'],

            // Food & Groceries — Needs
            ['name' => 'Market (Foodstuff)', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'shopping_basket', 'color' => '#eab308'],
            ['name' => 'Eating Out', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'restaurant', 'color' => '#eab308'],
            ['name' => 'Snacks/Small Chops', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'fastfood', 'color' => '#eab308'],
            ['name' => 'Drinks', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'local_bar', 'color' => '#eab308'],
            ['name' => 'Cooking Gas', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'local_fire_department', 'color' => '#eab308'],

            // Communication — Needs
            ['name' => 'Data (Airtime/Bundle)', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'signal_cellular_alt', 'color' => '#3b82f6'],
            ['name' => 'Phone Calls', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'call', 'color' => '#3b82f6'],
            ['name' => 'WiFi/Internet', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'wifi', 'color' => '#3b82f6'],
            ['name' => 'DSTV/GoTV/Showmax', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'live_tv', 'color' => '#3b82f6'],

            // Social & Giving — Wants
            ['name' => 'Aso-Ebi', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'checkroom', 'color' => '#a855f7'],
            ['name' => 'Owambe/Party Contributions', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'celebration', 'color' => '#a855f7'],
            ['name' => 'Spraying/Cash Gifts', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'volunteer_activism', 'color' => '#a855f7'],
            ['name' => 'Tithes/Offerings', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'church', 'color' => '#a855f7'],
            ['name' => 'Charity/Sadaqah (Zakat)', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'mosque', 'color' => '#a855f7'],
            ['name' => 'Birthday/Anniversary Gifts', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'cake', 'color' => '#a855f7'],

            // Family Obligations — Needs
            ['name' => 'Home Remittance', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'family_restroom', 'color' => '#ec4899'],
            ['name' => 'School Fees (Dependants)', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'school', 'color' => '#ec4899'],
            ['name' => 'Family Emergency', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'medical_services', 'color' => '#ec4899'],
            ['name' => 'Extended Family Support', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'groups', 'color' => '#ec4899'],

            // Health — Needs
            ['name' => 'Hospital/Clinic', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'local_hospital', 'color' => '#06b6d4'],
            ['name' => 'Pharmacy', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'medication', 'color' => '#06b6d4'],
            ['name' => 'Health Insurance (HMO)', 'type' => 'expense', 'budget_category' => 'needs', 'icon' => 'health_and_safety', 'color' => '#06b6d4'],
            ['name' => 'Gym/Fitness', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'fitness_center', 'color' => '#06b6d4'],

            // Personal Care — Wants
            ['name' => 'Hair/Barber', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'content_cut', 'color' => '#14b8a6'],
            ['name' => 'Clothes & Fashion', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'checkroom', 'color' => '#14b8a6'],
            ['name' => 'Skincare/Cosmetics', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'spa', 'color' => '#14b8a6'],
            ['name' => 'Laundry/Dry Cleaning', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'local_laundry_service', 'color' => '#14b8a6'],

            // Education & Growth — Wants
            ['name' => 'Books/Courses', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'menu_book', 'color' => '#6366f1'],
            ['name' => 'Professional Certifications', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'workspace_premium', 'color' => '#6366f1'],
            ['name' => 'Conferences', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'event', 'color' => '#6366f1'],
            ['name' => 'Personal Development', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'psychology', 'color' => '#6366f1'],

            // Savings & Investment — Savings/Investment
            ['name' => 'Ajo/Esusu (Thrift)', 'type' => 'expense', 'budget_category' => 'savings', 'icon' => 'savings', 'color' => '#22c55e'],
            ['name' => 'Emergency Fund', 'type' => 'expense', 'budget_category' => 'savings', 'icon' => 'shield', 'color' => '#22c55e'],
            ['name' => 'Stock Market (NGX)', 'type' => 'expense', 'budget_category' => 'investment', 'icon' => 'trending_up', 'color' => '#22c55e'],
            ['name' => 'Fixed Deposit', 'type' => 'expense', 'budget_category' => 'investment', 'icon' => 'account_balance', 'color' => '#22c55e'],
            ['name' => 'Crypto', 'type' => 'expense', 'budget_category' => 'investment', 'icon' => 'currency_bitcoin', 'color' => '#22c55e'],

            // Entertainment — Wants
            ['name' => 'Streaming Subscriptions', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'play_circle', 'color' => '#f43f5e'],
            ['name' => 'Cinema', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'movie', 'color' => '#f43f5e'],
            ['name' => 'Gaming', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'sports_esports', 'color' => '#f43f5e'],
            ['name' => 'Events/Concerts', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'theater_comedy', 'color' => '#f43f5e'],
            ['name' => 'Betting', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'casino', 'color' => '#f43f5e'],

            // Business/Side Hustle — Wants (could also be Needs depending on user)
            ['name' => 'Inventory/Stock', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'inventory_2', 'color' => '#0ea5e9'],
            ['name' => 'Business Transport', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'local_shipping', 'color' => '#0ea5e9'],
            ['name' => 'Marketing/Ads', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'campaign', 'color' => '#0ea5e9'],
            ['name' => 'Tools/Equipment', 'type' => 'expense', 'budget_category' => 'wants', 'icon' => 'construction', 'color' => '#0ea5e9'],
        ];
    }
}
