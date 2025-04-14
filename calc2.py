def calculate_single_feed(avg_weight):
    if avg_weight < 20:
        return 1.9 * (avg_weight / 20)
    elif 20 <= avg_weight <= 100:
        return 1.9 + 0.06375 * (avg_weight - 20)
    elif 100 < avg_weight <= 200:
        return 7 + 0.033 * (avg_weight - 100)
    elif 200 < avg_weight <= 300:
        return 10.3 + 0.032 * (avg_weight - 200)
    elif 300 < avg_weight <= 400:
        return 13.5 + 0.033 * (avg_weight - 300)
    elif 400 < avg_weight <= 700:
        return 16.8 + 0.01 * (avg_weight - 400)
    else:
        calculated_feed = 19.8 - 0.0013846 * (avg_weight - 700)
        return max(calculated_feed, 18)

def calculate_feed(total_fish, avg_weight):
    if avg_weight < 1 or avg_weight > 2000:
        return {"error": "Average weight must be between 1g and 2000g."}
    if total_fish < 1:
        return {"error": "Total number of fish must be at least 1."}
    
    if total_fish == 1:
        daily_feed_g = calculate_single_feed(avg_weight)
    else:
        if avg_weight <= 100:
            daily_feed_g = calculate_single_feed(avg_weight) * total_fish
        else:
            if avg_weight <= 600:
                per_fish = 20
            else:
                per_fish = 20 - (avg_weight - 600) * 0.00142857
                per_fish = max(per_fish, 18)
            daily_feed_g = per_fish * total_fish
    
    weekly_feed_g = daily_feed_g * 7

    def format_feed(feed_g):
        if feed_g >= 1000:
            return f"{feed_g / 1000:.1f} kg"
        else:
            return f"{round(feed_g, 1)}g"

    daily_feed = format_feed(daily_feed_g)
    weekly_feed = format_feed(weekly_feed_g)
    
    times = "3-4 times" if avg_weight < 100 else "2-3 times"
    
    return {
        "daily_feed": daily_feed,
        "weekly_feed": weekly_feed,
        "times_to_apply_daily": times
    }

# Input from user
total_fish = int(input("Enter the total number of fish: "))
avg_weight = float(input("Enter the average weight per fish (in grams): "))

# Calculate feed
result = calculate_feed(total_fish, avg_weight)

# Output results
if "error" in result:
    print(result["error"])
else:
    print(f"Daily Feed Quantity: {result['daily_feed']}")
    print(f"Weekly Feed Quantity: {result['weekly_feed']}")
    print(f"Times to Apply Daily: {result['times_to_apply_daily']}")