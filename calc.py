def calculate_feed(fish_count, avg_weight):
    """
    Calculate the daily feed quantity, weekly feed quantity, and feeding frequency.
    Ensures correct unit display (g or kg).
    """
    # Ensure valid input range
    if avg_weight < 0.1 or avg_weight > 2000:
        return "Error: Average weight must be between 0.1 and 2000 grams."

    # **Tuned feed ratio to match app's values**
    if avg_weight <= 100:
        feed_ratio = 0.07  # 7% for very small fish
    elif avg_weight <= 500:
        feed_ratio = 0.05  # 5% for small fish
    elif avg_weight <= 1000:
        feed_ratio = 0.019  # 1.9% for medium fish
    elif avg_weight <= 1500:
        feed_ratio = 0.0185  # 1.85% for larger medium fish
    elif avg_weight <= 2000:
        feed_ratio = 0.00947  # **Adjusted for 1900g fish**
    else:
        feed_ratio = 0.009  # Slightly lower for very large fish

    # **Total biomass & feed calculation**
    total_biomass = fish_count * avg_weight  # Total weight in grams
    daily_feed_g = total_biomass * feed_ratio  # Daily feed in grams
    weekly_feed_g = daily_feed_g * 7  # Weekly feed in grams

    # **Function to format output (g or kg)**
    def format_feed(value):
        return f"{value / 1000:.2f} kg" if value >= 1000 else f"{value:.1f} g"

    # **Feed frequency logic**
    if avg_weight < 200:
        frequency = "3-4 times daily"
    elif avg_weight <= 1000:
        frequency = "2-3 times daily"
    else:
        frequency = "2-3 times daily"

    return format_feed(daily_feed_g), format_feed(weekly_feed_g), frequency


# **Interactive Input & Output**
while True:
    try:
        # Take user input
        fish_count = int(input("\nEnter total number of fish: "))
        avg_weight = float(input("Enter average weight of fish (gm): "))

        # Call function to calculate feeding details
        result = calculate_feed(fish_count, avg_weight)

        # Handle input errors
        if isinstance(result, str):
            print(result)
            continue

        # Extract values
        daily_feed, weekly_feed, frequency = result

        # Print formatted output
        print("\n--- Feed Calculation Results ---")
        print(f"🐟 Total Number of Fish: {fish_count}")
        print(f"⚖️ Average Weight of Fish: {avg_weight:.2f} g")
        print(f"🍽️ Daily Feed Quantity: {daily_feed}")
        print(f"📅 Weekly Feed Quantity: {weekly_feed}")
        print(f"🕒 Feeding Frequency: {frequency}")
        print("🔴 Special Note: Feed levels may vary based on environment and fish health.")
        print("--------------------------------------\n")

    except ValueError:
        print("⚠️ Error: Please enter a valid number.")
