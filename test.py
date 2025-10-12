import requests
import time
import redis
import matplotlib.pyplot as plt
import statistics
import csv

BASE_URL = "http://localhost:3000/blogs"
REDIS_HOST = "localhost"
REDIS_PORT = 6379
NUM_KEYS = 1000

r = redis.Redis(
    host=REDIS_HOST,
    port=REDIS_PORT,
    password="Admin123",
    decode_responses=True
)


def populate_keys(count=NUM_KEYS, prefix="blog:"):
    pipe = r.pipeline()
    for i in range(1, count+1):
        pipe.set(f"{prefix}{i}", f'{{"id":{i},"title":"Blog {i}"}}')
    pipe.execute()

def clear_keys(pattern="blog:*"):
    # safer: scan + delete in batches
    cursor = 0
    total = 0
    while True:
        cursor, keys = r.scan(cursor=cursor, match=pattern, count=1000)
        if keys:
            r.delete(*keys)
            total += len(keys)
        if cursor == 0:
            break
    return total

def measure_time(url, repeat=1, timeout=30):
    durations = []
    for i in range(repeat):
        start = time.time()
        try:
            res = requests.get(url, timeout=timeout)
            res.raise_for_status()
        except Exception as e:
            print("Request error:", e)
            durations.append(None)
            continue
        end = time.time()
        durations.append((end - start) * 1000.0)
    # filter out None
    return [d for d in durations if d is not None]

def main(runs=5, get_repeats=3):
    # ensure clean start
    clear_keys("blog:*")
    results = {
        "lua_get": [],
        "lua_delete": [],
        "trad_get": [],
        "trad_delete": []
    }

    for run in range(runs):
        print(f"\n--- Run {run+1}/{runs} ---")

        # populate keys before lua get
        populate_keys(NUM_KEYS)
        print("Populated keys:", NUM_KEYS)

        print("Testing: Lua GET x", get_repeats)
        lua_get_times = measure_time(f"{BASE_URL}/lua", repeat=get_repeats)
        lua_get_avg = statistics.mean(lua_get_times) if lua_get_times else float('nan')
        print("Lua GET times (ms):", lua_get_times, "avg:", lua_get_avg)
        results["lua_get"].append(lua_get_avg)

        # ensure keys exist before delete
        # we populated already above; now call delete-lua
        print("Testing: Lua DELETE (bulk)")
        lua_del_times = measure_time(f"{BASE_URL}/delete-lua", repeat=1)
        lua_del = lua_del_times[0] if lua_del_times else float('nan')
        print("Lua DELETE (ms):", lua_del)
        results["lua_delete"].append(lua_del)

        # repopulate for traditional test
        clear_keys("blog:*")
        populate_keys(NUM_KEYS)
        print("Re-populated keys for traditional test")

        print("Testing: Traditional GET x", get_repeats)
        trad_get_times = measure_time(f"{BASE_URL}/test", repeat=get_repeats)
        trad_get_avg = statistics.mean(trad_get_times) if trad_get_times else float('nan')
        print("Traditional GET times (ms):", trad_get_times, "avg:", trad_get_avg)
        results["trad_get"].append(trad_get_avg)

        print("Testing: Traditional DELETE (bulk)")
        trad_del_times = measure_time(f"{BASE_URL}/delete-trad", repeat=1)
        trad_del = trad_del_times[0] if trad_del_times else float('nan')
        print("Traditional DELETE (ms):", trad_del)
        results["trad_delete"].append(trad_del)

        # cleanup between runs
        clear_keys("blog:*")

    # summary
    print("\n=== Summary (averages per run) ===")
    summary = {}
    for k, arr in results.items():
        summary[k] = statistics.mean([x for x in arr if not (x is None)]) if arr else float('nan')
        print(f"{k}: {summary[k]:.2f} ms (mean across runs)")

    # save CSV
    with open("benchmark_data.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["run", "lua_get_ms", "lua_delete_ms", "trad_get_ms", "trad_delete_ms"])
        for i in range(runs):
            writer.writerow([
                i+1,
                results["lua_get"][i],
                results["lua_delete"][i],
                results["trad_get"][i],
                results["trad_delete"][i]
            ])
    print("Saved CSV: benchmark_data.csv")

    # plot bar chart of overall means
    labels = ["Lua Get", "Lua Delete", "Traditional Get", "Traditional Delete"]
    means = [summary["lua_get"], summary["lua_delete"], summary["trad_get"], summary["trad_delete"]]

    plt.figure(figsize=(10,6))
    bars = plt.bar(labels, means, color=['#10b981', '#34d399', '#ef4444', '#f87171'])
    plt.title("So sánh thời gian Redis: Lua vs Traditional")
    plt.ylabel("Thời gian trung bình (ms)")
    plt.grid(axis='y', linestyle='--', alpha=0.4)

    for bar, m in zip(bars, means):
        plt.text(bar.get_x() + bar.get_width()/2, bar.get_height() + max(means)*0.01, f"{m:.1f} ms",
                 ha='center', va='bottom')

    plt.tight_layout()
    plt.savefig("benchmark_result.png")
    print("Saved chart: benchmark_result.png")

if __name__ == "__main__":
    main(runs=5, get_repeats=3)
