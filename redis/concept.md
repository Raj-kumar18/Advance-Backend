# 🔴 Redis + Redis-io + BullMQ — Complete Concept Documentation
### Zero se Production-Level tak (Interview Revision Ready)
---

## 📑 Table of Contents

1. What is Redis?
2. Why Redis? (Use Cases)
3. Memory Architecture (Internal Working)
4. Redis Installation
5. Redis CLI
6. Data Types (Strings, Lists, Sets, Sorted Sets, Hashes, Bitmaps, HyperLogLog, Streams, Geospatial, JSON)
7. TTL & Expiration
8. Persistence (RDB, AOF, Hybrid)
9. Pub/Sub
10. Transactions
11. Pipelines
12. Lua Scripting
13. Caching Strategies
14. Session Storage
15. Rate Limiting
16. Distributed Locks
17. Leaderboards
18. BullMQ (Queue, Worker, Job, Events, Delayed, Retry, Priority, Repeatable, Scheduler)
19. Redis Streams (deep dive)
20. Redis Cluster
21. Replication
22. Sentinel
23. Memory Optimization
24. Production Best Practices
25. Interview Questions Bank
26. Complete MERN Examples
27. Cheat Sheet

---

# 01. What is Redis?

**Redis** = **RE**mote **DI**ctionary **S**erver.

Ye ek **in-memory, key-value data structure store** hai jo cache, database, aur message broker teeno ka kaam karta hai.

- Data RAM mein store hota hai → isliye read/write **microseconds** mein hoti hai (Disk-based DB jaise MySQL/Postgres mein milliseconds lagte hain).
- Single-threaded event loop (Redis 6+ mein I/O threading bhi hai, but command execution abhi bhi single-threaded hai) → isliye race condition ka tension kam.
- Ye sirf "cache" nahi hai — ye ek **full data structure server** hai (String, List, Set, Hash, Sorted Set, Stream, Bitmap, HyperLogLog, Geo).

```
┌─────────────────────────────────────┐
│              REDIS SERVER            │
│                                       │
│   RAM (Primary Storage)              │
│   ┌───────────────────────────┐     │
│   │ key1 -> "value"            │     │
│   │ key2 -> [list items]       │     │
│   │ key3 -> {hash fields}      │     │
│   │ key4 -> {sorted set}       │     │
│   └───────────────────────────┘     │
│                                       │
│   Disk (Persistence - optional)      │
│   ┌───────────────────────────┐     │
│   │ dump.rdb  /  appendonly.aof│     │
│   └───────────────────────────┘     │
└─────────────────────────────────────┘
```

**Key Points:**
- Written in C, extremely fast.
- NoSQL category — key-value store.
- Supports **replication**, **clustering**, **persistence**, **pub/sub**, **scripting**.
- Redis Stack / Redis-io = Redis + modules (RedisJSON, RediSearch, RedisTimeSeries, RedisGraph, RedisBloom).

---

# 02. Why Redis? (Use Cases)

| Use Case | Kyun Redis? |
|---|---|
| **Caching** | DB load kam karna, response time microseconds mein lana |
| **Session Store** | Fast read/write, TTL built-in, horizontal scaling ke liye shared session |
| **Rate Limiting** | Atomic INCR + TTL se sliding/fixed window bana sakte ho |
| **Pub/Sub Messaging** | Real-time notifications, chat apps |
| **Queues (via BullMQ)** | Background jobs — email, PDF generation, video processing |
| **Leaderboard** | Sorted Set se O(log N) rank calculation |
| **Distributed Locks** | Multiple servers mein ek hi resource ka access control |
| **Real-time Analytics** | HyperLogLog (unique visitors), Bitmaps (daily active users) |
| **Geospatial** | "Nearby restaurants" jaise features |

### Redis vs Traditional DB

```
Traditional DB (Postgres/MySQL)          Redis
─────────────────────────────           ─────────────────────────────
Disk-based                                In-memory (RAM)
Read: ~5-10ms                             Read: ~0.1ms (100x faster)
ACID transactions (strong)                Simpler transactions (MULTI/EXEC)
Complex queries (JOIN, WHERE)             Simple key-based lookups
Data survives restart (default)           Data volatile (unless persistence on)
Best for: Source of truth                 Best for: Speed layer / cache
```

### Kab Redis use NAHI karna chahiye?
- Jab data ka size RAM se bahut zyada ho (RAM costly hota hai)
- Jab complex relational queries chahiye (JOINs, aggregations)
- Jab data ko primary source of truth banana ho aur strong durability chahiye by default

---

# 03. Memory Architecture (Internal Working)

Redis internally kaise kaam karta hai — ye samajhna interview ke liye critical hai.

```
                    CLIENT REQUEST
                          │
                          ▼
              ┌────────────────────┐
              │   Event Loop        │  (single-threaded,
              │   (epoll/kqueue)    │   uses multiplexing)
              └─────────┬──────────┘
                          │
                          ▼
              ┌────────────────────┐
              │  Command Dispatcher │
              └─────────┬──────────┘
                          │
                          ▼
              ┌────────────────────┐
              │  Data Structure     │
              │  Engine (Hash Table)│
              └─────────┬──────────┘
                          │
                          ▼
              ┌────────────────────┐
              │  RAM (In-Memory     │
              │  Key-Value Store)   │
              └────────────────────┘
```

### Internal Data Structure

Redis ke andar **top-level dictionary (hash table)** hota hai jisme:
- **Key** = string
- **Value** = pointer to actual data structure (SDS string, linked list, skiplist, hashtable, intset, ziplist/listpack)

```
Global Hash Table (redisDb->dict)
┌──────────────────────────────────┐
│ "user:1"  ──► RedisObject(String) │
│ "cart:1"  ──► RedisObject(Hash)   │
│ "queue:1" ──► RedisObject(List)   │
│ "tags"    ──► RedisObject(Set)    │
└──────────────────────────────────┘
```

### Single-Threaded kyun hai?

- Context switching ka overhead nahi.
- Race condition nahi (koi lock ki zaroorat nahi commands ke beech).
- Bottleneck sirf CPU-bound heavy commands hain (jaise `KEYS *`, badi SORT ops) — inhe avoid karo production mein.
- Redis 6+ mein **I/O threading** aaya hai (network read/write parallel), but command execution abhi bhi single thread pe hoti hai.

### SDS (Simple Dynamic String)

Redis apna khud ka string implementation use karta hai (C ka null-terminated string nahi):

```
struct sdshdr {
    int len;       // current length
    int free;      // free space available
    char buf[];     // actual data
}
```

Fayda: O(1) length lookup, binary-safe (null bytes allow), buffer overflow se safe, amortized O(1) append.

### Eviction Policies (jab RAM full ho jaye)

| Policy | Behavior |
|---|---|
| `noeviction` | Naye writes reject, error return (default) |
| `allkeys-lru` | Sabse kam recently used key delete |
| `volatile-lru` | Sirf TTL wali keys mein se LRU delete |
| `allkeys-lfu` | Sabse kam frequently used key delete |
| `volatile-lfu` | TTL wali keys mein se LFU delete |
| `allkeys-random` | Random key delete |
| `volatile-random` | TTL wali keys mein se random delete |
| `volatile-ttl` | Sabse kam TTL wali key pehle delete |

```
maxmemory 100mb
maxmemory-policy allkeys-lru
```

---

# 04. Redis Installation

### Ubuntu/Linux
```bash
sudo apt update
sudo apt install redis-server -y
redis-server --version
sudo systemctl start redis
sudo systemctl enable redis
```

### Docker (recommended for dev)
```bash
docker run -d --name redis -p 6379:6379 redis:7-alpine

# Redis Stack (with RedisJSON, RediSearch, etc.)
docker run -d --name redis-stack -p 6379:6379 -p 8001:8001 redis/redis-stack:latest
```

### Node.js Client Install
```bash
npm install ioredis          # recommended (feature-rich, cluster support)
# OR
npm install redis            # official client
npm install bullmq           # queue/worker system built on Redis
```

### Basic Connection (ioredis)
```js
const Redis = require("ioredis");
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
  password: process.env.REDIS_PASSWORD, // agar auth hai
  maxRetriesPerRequest: null, // BullMQ ke liye zaroori
});

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));
```

---

# 05. Redis CLI

```bash
redis-cli                     # connect to localhost:6379
redis-cli -h host -p port -a password

PING                          # server alive? -> PONG
SET name "Raj"
GET name
DEL name
EXISTS name
KEYS *                        # ⚠️ production mein mat use karo (blocking, O(N))
SCAN 0                        # KEYS ka safe alternative (cursor-based, non-blocking)
TTL name                      # remaining seconds
EXPIRE name 60
FLUSHALL                      # ⚠️ sab data delete — danger command
FLUSHDB                       # current DB ka data delete
INFO                          # server stats
MONITOR                       # real-time command stream (debug ke liye)
DBSIZE                        # total keys count
TYPE key                      # key ka data type batata hai
CONFIG GET maxmemory
CONFIG SET maxmemory 100mb
```

### SCAN vs KEYS

```
KEYS *  → ek hi shot mein SAB keys scan karta hai → O(N) → server BLOCK ho jata hai
SCAN 0  → cursor based, chhote batches mein iterate karta hai → non-blocking
```

```bash
redis-cli SCAN 0 MATCH "user:*" COUNT 100
```

---

# 06. Data Types

Redis ke data types hi uska core power hain. Har type ka apna internal encoding hota hai (memory-efficient).

## 6.1 Strings

Sabse basic type. Binary-safe (text, JSON, serialized image, counter — kuch bhi store kar sakte ho, max 512MB).

```bash
SET user:1:name "Raj"
GET user:1:name
APPEND user:1:name " Kumar"
STRLEN user:1:name
INCR page:views              # atomic increment
INCRBY page:views 5
DECR stock:count
SETEX otp:9876543210 300 "482913"   # TTL ke saath set (300 sec)
SETNX lock:resource1 "locked"       # sirf tab set hoga jab key exist na kare (SET IF NOT EXISTS)
MSET a 1 b 2 c 3              # multiple set
MGET a b c                    # multiple get
GETSET user:1:status "active" # purani value return karo, nayi set karo
```

**Internal Encoding:** `int` (agar number hai), `embstr` (chhoti string ≤44 bytes), `raw` (badi string)

**Time Complexity:** GET/SET = O(1), APPEND = O(1) amortized, INCR = O(1)

**Use cases:** Counters, flags, cached JSON, session tokens, OTP, feature flags

### Node.js Example
```js
await redis.set("user:1:name", "Raj");
const name = await redis.get("user:1:name");
await redis.incr("page:views");
await redis.setex(`otp:${phone}`, 300, otp); // OTP with 5 min expiry
```

---

## 6.2 Lists

Ordered collection, duplicate allowed. Internally **linked list / quicklist** (linked list of ziplists) hai.

```
LPUSH  → left (head) se insert     RPUSH → right (tail) se insert
┌───┬───┬───┬───┐
│ 3 │ 2 │ 1 │...│  <- LPUSH pushes here (head)
└───┴───┴───┴───┘
                    RPUSH pushes here (tail) ->
```

```bash
LPUSH tasks "task1"
RPUSH tasks "task2"
LRANGE tasks 0 -1        # sab elements dekho
LPOP tasks                # head se nikalo
RPOP tasks                # tail se nikalo
LLEN tasks
LINDEX tasks 0
BLPOP tasks 5             # blocking pop — 5 sec tak wait karega agar list empty ho
```

**Time Complexity:** LPUSH/RPUSH = O(1), LPOP/RPOP = O(1), LRANGE = O(S+N), LINDEX = O(N)

**Use Cases:** Simple queues (BullMQ khud List + ZSet ka combo use karta hai internally), activity feeds, recent items list, undo history

### BLPOP se simple queue (BullMQ se pehle ka pattern)
```js
// Producer
await redis.lpush("email-queue", JSON.stringify({ to: "raj@x.com", subject: "Welcome" }));

// Consumer (blocking wait)
const [key, job] = await redis.blpop("email-queue", 0); // 0 = infinite wait
console.log(JSON.parse(job));
```

---

## 6.3 Sets

Unordered, **unique** elements collection. Internally **intset** (sirf integers ho to) ya **hashtable**.

```bash
SADD tags "nodejs" "redis" "mongodb"
SMEMBERS tags
SISMEMBER tags "redis"       # O(1) membership check
SREM tags "mongodb"
SCARD tags                    # count
SINTER set1 set2              # intersection (common elements)
SUNION set1 set2              # union
SDIFF set1 set2               # difference
```

**Time Complexity:** SADD/SREM/SISMEMBER = O(1), SINTER/SUNION = O(N*M)

**Use Cases:** Unique visitors tracker, tags system, "mutual friends" (SINTER), blocklist/whitelist, deduplication

```
SINTER "user:1:friends" "user:2:friends"
┌──────────┐   ┌──────────┐
│ A, B, C  │ ∩ │ B, C, D  │  =  { B, C }  (mutual friends)
└──────────┘   └──────────┘
```

---

## 6.4 Sorted Sets (ZSet)

Set jisme har member ka ek **score** hota hai, score ke basis pe sorted rehta hai. Internally **skip list + hash table**.

```
Score-based ordering (Skip List):

Level 3:  HEAD ─────────────────────► 50 ──────────► NIL
Level 2:  HEAD ───────► 20 ─────────► 50 ──────────► NIL
Level 1:  HEAD ─► 10 ─► 20 ─► 35 ───► 50 ─► 60 ─────► NIL
```

```bash
ZADD leaderboard 100 "raj"
ZADD leaderboard 250 "aman"
ZADD leaderboard 180 "priya"
ZRANGE leaderboard 0 -1 WITHSCORES        # ascending
ZREVRANGE leaderboard 0 -1 WITHSCORES     # descending (top scorer first)
ZRANK leaderboard "raj"                    # rank (0-indexed, ascending)
ZREVRANK leaderboard "raj"                 # rank descending (leaderboard rank)
ZSCORE leaderboard "raj"
ZINCRBY leaderboard 50 "raj"               # score badhao
ZRANGEBYSCORE leaderboard 100 200          # score range se fetch
ZREM leaderboard "raj"
```

**Time Complexity:** ZADD = O(log N), ZRANGE = O(log N + M), ZRANK = O(log N)

**Use Cases:** Leaderboards, priority queues (BullMQ delayed jobs isi pe based hain!), rate limiting (sliding window), trending items (time as score)

---

## 6.5 Hashes

Field-value pairs — ek object jaisa. Internally **listpack** (chhota) ya **hashtable** (bada).

```
user:1 (hash)
┌─────────┬──────────┐
│ name    │ "Raj"     │
│ age     │ "18"      │
│ city    │ "Patna"   │
└─────────┴──────────┘
```

```bash
HSET user:1 name "Raj" age 18 city "Patna"
HGET user:1 name
HGETALL user:1
HDEL user:1 age
HEXISTS user:1 name
HINCRBY user:1 age 1
HKEYS user:1
HVALS user:1
HLEN user:1
```

**Time Complexity:** HSET/HGET = O(1), HGETALL = O(N)

**Use Cases:** User objects, product details, config storage — jab pura JSON object baar-baar deserialize nahi karna (ek single string se better, kyunki individual field update ho sakta hai without full rewrite)

```js
await redis.hset(`user:${id}`, { name: "Raj", age: 18, city: "Patna" });
const user = await redis.hgetall(`user:${id}`);
```

---

## 6.6 Bitmaps

String hi hai, bas bit-level operations. Extremely memory efficient.

```bash
SETBIT daily:active:2026-08-01 12345 1   # user id 12345 ne aaj login kiya
GETBIT daily:active:2026-08-01 12345
BITCOUNT daily:active:2026-08-01          # total active users count
BITOP AND result daily:2026-08-01 daily:2026-08-02  # dono din active users
```

**Use Cases:** Daily active users, feature flags per user, attendance systems (1 bit per user per day = super memory efficient)

---

## 6.7 HyperLogLog

Approximate unique count — sirf **12KB** mein millions of unique items count kar sakta hai (0.81% error margin).

```bash
PFADD unique:visitors "user1" "user2" "user3"
PFCOUNT unique:visitors     # approx unique count
PFMERGE total unique:visitors:page1 unique:visitors:page2
```

**Use Cases:** Unique visitor counting on high-traffic sites jahan exact count zaroori nahi (Set se 1000x kam memory)

---

## 6.8 Streams

Append-only log structure — Kafka jaisa lightweight messaging. (Detailed section 19 mein)

```bash
XADD orders '*' orderId 101 status "placed"
XRANGE orders - +
XREAD COUNT 10 STREAMS orders 0
```

---

## 6.9 Geospatial

Sorted Set pe based, latitude/longitude store karta hai geohash encoding se.

```bash
GEOADD restaurants 85.1376 25.5941 "Domino's Patna"
GEOADD restaurants 85.1450 25.6100 "KFC Patna"
GEODIST restaurants "Domino's Patna" "KFC Patna" km
GEOSEARCH restaurants FROMLONLAT 85.14 25.60 BYRADIUS 5 km
```

**Use Cases:** "Nearby restaurants/stores" features, ride-hailing driver matching

---

## 6.10 JSON (Redis Stack / RedisJSON module)

```bash
JSON.SET user:1 $ '{"name":"Raj","skills":["Node","React"]}'
JSON.GET user:1
JSON.SET user:1 $.name '"Raj Kumar"'
```

Fayda: Nested JSON ko directly manipulate kar sakte ho without full GET-modify-SET cycle.

---

## Data Type Selection Table

| Requirement | Best Data Type |
|---|---|
| Simple cache value | String |
| Counter/rate limit | String (INCR) |
| Queue (basic) | List |
| Unique items | Set |
| Leaderboard/ranking | Sorted Set |
| Object/user profile | Hash |
| Daily active tracking | Bitmap |
| Unique visitor count (approx) | HyperLogLog |
| Event log / message queue | Stream |
| Location-based search | Geospatial |
| Complex nested JSON | RedisJSON |

---

# 07. TTL & Expiration

```bash
SET session:abc123 "userdata" EX 3600     # 1 hour TTL
EXPIRE session:abc123 3600                 # existing key pe TTL lagao
TTL session:abc123                          # remaining seconds (-1 = no expiry, -2 = key nahi hai)
PERSIST session:abc123                      # TTL hatao (permanent bana do)
PTTL session:abc123                         # milliseconds mein remaining time
EXPIREAT session:abc123 1735689600          # unix timestamp pe expire
```

### Expiration Internally Kaise Kaam Karta Hai?

Redis do strategies use karta hai **saath mein**:

```
1. PASSIVE (Lazy) Expiration
   Client jab bhi key access kare -> Redis check karta hai TTL expire hui?
   Agar haan -> key delete + null return

2. ACTIVE Expiration
   Redis background mein har 100ms pe random sample leta hai keys ka
   ┌─────────────────────────────────┐
   │  20 random keys with TTL pick   │
   │  jitni expired mili, delete     │
   │  agar >25% expired the, repeat  │
   └─────────────────────────────────┘
```

Isse memory leak nahi hota — sirf lazy hoती to expired keys hamesha RAM mein padi rehti jab tak access na ho.

### Common Mistake
- TTL set karna bhool jaana → memory leak, RAM full ho jata hai
- Bahut chhota TTL → cache miss zyada, DB load badh jata hai
- Bahut bada TTL → stale data serve hota reh sakta hai

---

# 08. Persistence

Redis by default in-memory hai, matlab server restart = data gone. Persistence isse bachata hai.

## 8.1 RDB (Redis Database Backup)

Point-in-time **snapshot** — pura dataset ek binary file (`dump.rdb`) mein dump hota hai.

```
redis.conf:
save 900 1      # 900 sec mein kam se kam 1 key change hui to snapshot lo
save 300 10      # 300 sec mein 10 keys change
save 60 10000     # 60 sec mein 10000 keys change
```

```
Redis Process (parent)
       │
       │ fork()
       ▼
Child Process (copy-on-write memory)
       │
       │ writes snapshot
       ▼
   dump.rdb file
```

✅ **Pros:** Compact single file, fast restart, backup ke liye best
❌ **Cons:** Crash ho jaye to last snapshot ke baad ka data lost (data loss window)

## 8.2 AOF (Append Only File)

Har write command ko log file mein append karta hai. Restart pe commands replay hote hain.

```
appendonly yes
appendfsync everysec   # options: always | everysec | no
```

```
SET name "Raj"     ──► appended to appendonly.aof
INCR counter        ──► appended to appendonly.aof
DEL oldkey           ──► appended to appendonly.aof
```

| fsync policy | Durability | Performance |
|---|---|---|
| `always` | Har command disk pe sync (sabse safe) | Sabse slow |
| `everysec` | Har second sync (default, balanced) | Good |
| `no` | OS decide karta hai kab sync | Sabse fast, risky |

✅ **Pros:** Kam data loss (max 1 sec with everysec)
❌ **Cons:** File RDB se bada hota hai, restart slow ho sakta hai (replay)

**AOF Rewrite:** Jab file bahut badi ho jaye, Redis background mein compact version banata hai (jaise 100 INCR commands ko ek `SET counter 100` mein compress kar dega)

## 8.3 Hybrid (RDB + AOF) — Recommended for Production

```
aof-use-rdb-preamble yes
```

AOF file ke start mein RDB format snapshot hota hai, uske baad recent commands AOF format mein — fast restart + minimal data loss dono.

### Comparison Table

| | RDB | AOF | Hybrid |
|---|---|---|---|
| File size | Small | Large | Medium |
| Restart speed | Fast | Slow | Fast |
| Data loss risk | High (snapshot gap) | Low | Low |
| Use case | Backups, disaster recovery | Durability critical | Production default |

---

# 09. Pub/Sub

Publish-Subscribe messaging pattern — real-time broadcast (persist nahi hota, jo subscriber offline tha wo message miss kar dega).

```
Publisher                    Redis                  Subscribers
    │                          │                          │
PUBLISH channel "msg" ────►  ┌─────┐  ─────────► Subscriber A
                              │chan │  ─────────► Subscriber B
                              └─────┘  ─────────► Subscriber C
```

```bash
# Terminal 1 (Subscriber)
SUBSCRIBE notifications

# Terminal 2 (Publisher)
PUBLISH notifications "New order received!"
```

```js
// Node.js
const subscriber = new Redis();
const publisher = new Redis();

subscriber.subscribe("notifications", (err, count) => {
  console.log(`Subscribed to ${count} channel(s)`);
});

subscriber.on("message", (channel, message) => {
  console.log(`Received on ${channel}: ${message}`);
});

publisher.publish("notifications", "New order received!");
```

### Pattern Subscribe
```bash
PSUBSCRIBE user:*:notifications
```

### Limitations (isiliye Streams/BullMQ better hai jobs ke liye)
- Message **persist nahi hota** — subscriber offline tha to message permanently lost
- No acknowledgment, no retry mechanism
- Isliye: Pub/Sub = real-time broadcast (chat, live notification), Streams/BullMQ = reliable job processing

---

# 10. Transactions

`MULTI`/`EXEC` se multiple commands ek atomic batch mein execute hote hain.

```bash
MULTI
SET a 1
INCR a
SET b 2
EXEC
```

```
Client                        Redis
  │                             │
MULTI ─────────────────────►  QUEUED (command queue start)
SET a 1 ─────────────────►    QUEUED
INCR a ──────────────────►    QUEUED
EXEC ────────────────────►    [all commands execute atomically, no interruption]
```

**Important:** Redis transactions **rollback nahi** karte agar beech mein ek command fail ho (jaise wrong type pe operation) — baaki commands phir bhi execute honge. Ye SQL transactions se different hai!

### WATCH (Optimistic Locking)

```bash
WATCH balance
val = GET balance
MULTI
SET balance (val - 100)
EXEC     # agar WATCH ke baad "balance" kisi aur ne change kar diya, EXEC fail (nil) return karega
```

```js
// Node.js example: safe balance deduction
await redis.watch("balance");
const balance = parseInt(await redis.get("balance"));
if (balance >= 100) {
  const multi = redis.multi();
  multi.decrby("balance", 100);
  const result = await multi.exec();
  if (result === null) {
    console.log("Conflict detected — retry needed");
  }
}
```

---

# 11. Pipelines

Multiple commands ek hi network round-trip mein bhejo — latency drastically kam.

```
Without Pipeline:                    With Pipeline:
Client → Redis (RTT 1)                Client → Redis (all commands batched)
Client → Redis (RTT 2)                          ↓
Client → Redis (RTT 3)                Redis → Client (all responses at once)
= 3x network round trips              = 1x network round trip
```

```js
const pipeline = redis.pipeline();
pipeline.set("a", 1);
pipeline.incr("a");
pipeline.get("a");
const results = await pipeline.exec();
// results = [[null,'OK'], [null,2], [null,'2']]
```

**Note:** Pipeline = batch execution (network optimization), Transaction (MULTI/EXEC) = atomicity guarantee. Ye alag concepts hain — pipeline atomic nahi hota by default (par ioredis `.multi()` chain karke pipeline+transaction dono mila sakte ho).

---

# 12. Lua Scripting

Server-side atomic script execution — complex multi-step logic ek hi atomic operation mein.

```bash
EVAL "return redis.call('SET', KEYS[1], ARGV[1])" 1 mykey myvalue
```

```js
const script = `
  local current = redis.call('GET', KEYS[1])
  if current == false then
    redis.call('SET', KEYS[1], ARGV[1])
    return 1
  else
    return 0
  end
`;
const result = await redis.eval(script, 1, "lock:resource", "locked");
```

**Why Lua?** Redis guarantee karta hai poora script **atomically** execute hoga — koi doosra client beech mein interfere nahi kar sakta. Ye distributed locks, rate limiters, aur complex atomic operations ke liye perfect hai.

**Use Cases:** Rate limiter (check + increment atomically), distributed lock release (check owner + delete atomically), atomic leaderboard updates

---

# 13. Caching Strategies

## 13.1 Cache Aside (Lazy Loading) — Sabse Common Pattern

```
Client
   │
GET user:1
   │
   ▼
┌─────────┐
│  Redis   │
└────┬────┘
     │
Cache Hit? ──Yes──► Return Data (fast!)
     │
     No (Cache Miss)
     │
     ▼
┌─────────┐
│PostgreSQL│
└────┬────┘
     │
SET user:1 (cache mein bhar do, TTL ke saath)
     │
     ▼
Return Data
```

```js
async function getUser(id) {
  const cached = await redis.get(`user:${id}`);
  if (cached) return JSON.parse(cached);          // cache hit

  const user = await db.query("SELECT * FROM users WHERE id=$1", [id]); // cache miss
  await redis.setex(`user:${id}`, 3600, JSON.stringify(user));
  return user;
}
```

✅ Simple, only requested data cache hoti hai
❌ Pehli request hamesha slow (cache miss), stale data risk agar DB update ho aur cache invalidate na ho

## 13.2 Read Through

Application seedhe DB se baat nahi karta — ek caching layer/library beech mein handle karta hai (application ko cache-miss ka logic likhna nahi padta, library khud karti hai). Conceptually cache-aside jaisa hi hai, bas abstraction layer application se hata deta hai.

## 13.3 Write Through

Write hote hi cache AUR DB dono synchronously update hote hain.

```
Client
   │
UPDATE user:1
   │
   ▼
┌─────────┐        ┌─────────┐
│  Redis   │───────►│PostgreSQL│
│ (write)  │        │ (write)  │
└─────────┘        └─────────┘
   Both succeed together (synchronous)
```

```js
async function updateUser(id, data) {
  await db.query("UPDATE users SET ... WHERE id=$1", [id]);
  await redis.setex(`user:${id}`, 3600, JSON.stringify(data)); // cache turant sync
}
```

✅ Cache hamesha fresh rehta hai
❌ Write thoda slow (do jagah write karna padta hai)

## 13.4 Write Behind (Write Back)

Write pehle cache mein hota hai, DB mein **async/batched** likha jata hai baad mein.

```
Client → Redis (immediate write) → [Queue/Buffer] → DB (async, batched later)
```

✅ Bahut fast writes
❌ Risk: Redis crash ho jaye batch flush se pehle to data loss; complex to implement

## 13.5 Refresh Ahead

TTL expire hone se **pehle** hi background mein cache ko refresh kar diya jata hai (predictive), taaki user ko kabhi cache-miss latency na dikhe.

```
TTL: 60s ─────────────────────────► Expiry
              ▲
         50s pe hi
    background refresh trigger
    (before actual expiry)
```

✅ User ko kabhi stale/miss delay nahi dikhta
❌ Complex, extra background jobs chahiye, aur agar prediction galat ho to wasted refresh calls

### Cache Invalidation Strategies

| Strategy | Description |
|---|---|
| TTL-based | Simplest — bas expire hone do |
| Write-through invalidation | Update ke saath cache bhi update/delete karo |
| Event-based | Pub/Sub se dusre services ko cache invalidate karne ka signal bhejo |
| Versioned keys | `user:1:v2` — naya version banao, purana khud expire ho jayega |

> "There are only two hard things in Computer Science: cache invalidation and naming things." — famous quote, but sach mein cache invalidation tricky hai!

---

# 14. Session Storage

Redis session storage ke liye ideal hai — fast, TTL built-in, multiple server instances ke beech shared state.

```
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Server 1 │     │ Server 2 │     │ Server 3 │   (Load balanced, stateless servers)
└────┬─────┘     └────┬─────┘     └────┬─────┘
     │                 │                 │
     └─────────────────┼─────────────────┘
                        ▼
                 ┌─────────────┐
                 │ Redis (shared│
                 │ session store)│
                 └─────────────┘
```

**Why not server memory?** Agar session server ki RAM mein store ho aur load balancer request ko dusre server pe bheje → user "logged out" dikhega. Redis se sab servers same session dekh sakte hain.

```js
const session = require("express-session");
const RedisStore = require("connect-redis").default;

app.use(session({
  store: new RedisStore({ client: redis }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 3600000 }, // 1 hour
}));
```

### JWT Refresh Token Pattern (Raj ke project jaisa)
```js
// Per-device session tracking with hashed refresh tokens
const hashedToken = crypto.createHash("sha256").update(refreshToken).digest("hex");
await redis.setex(`refresh:${userId}:${deviceId}`, 7 * 24 * 3600, hashedToken);

// Logout from specific device
await redis.del(`refresh:${userId}:${deviceId}`);

// Logout from all devices
const keys = await redis.keys(`refresh:${userId}:*`); // (production: SCAN use karo)
if (keys.length) await redis.del(...keys);
```

---

# 15. Rate Limiting

## 15.1 Fixed Window Counter

```bash
INCR rate:user:1:2026-08-01-10        # current hour ka counter
EXPIRE rate:user:1:2026-08-01-10 3600
```

```js
async function fixedWindowLimit(userId, limit = 100) {
  const window = new Date().toISOString().slice(0, 13); // hour granularity
  const key = `rate:${userId}:${window}`;
  const count = await redis.incr(key);
  if (count === 1) await redis.expire(key, 3600);
  return count <= limit;
}
```

```
Window: [10:00 ────────────── 11:00]
Requests: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ (100 max)
Problem: Boundary burst — 10:59 pe 100 requests + 11:00 pe turant 100 aur = 200 in 1 sec!
```

## 15.2 Sliding Window Log (accurate, Sorted Set based)

```js
async function slidingWindowLimit(userId, limit = 100, windowMs = 60000) {
  const key = `rate:sw:${userId}`;
  const now = Date.now();
  const windowStart = now - windowMs;

  const multi = redis.multi();
  multi.zremrangebyscore(key, 0, windowStart);  // purane entries hatao
  multi.zadd(key, now, `${now}-${Math.random()}`);
  multi.zcard(key);                              // current window count
  multi.expire(key, Math.ceil(windowMs / 1000));
  const results = await multi.exec();

  const count = results[2][1];
  return count <= limit;
}
```

## 15.3 Token Bucket (Lua script for atomicity)

```
Bucket capacity: 10 tokens
Refill rate: 1 token/sec

┌───────────────┐
│ ● ● ● ● ● ● ● │  7 tokens available
└───────────────┘
Request comes → 1 token consumed → 6 left
No tokens left → request REJECTED (429)
Tokens refill over time
```

```js
const tokenBucketScript = `
  local key = KEYS[1]
  local capacity = tonumber(ARGV[1])
  local refillRate = tonumber(ARGV[2])
  local now = tonumber(ARGV[3])

  local bucket = redis.call('HMGET', key, 'tokens', 'timestamp')
  local tokens = tonumber(bucket[1]) or capacity
  local timestamp = tonumber(bucket[2]) or now

  local delta = math.max(0, now - timestamp)
  tokens = math.min(capacity, tokens + delta * refillRate)

  if tokens < 1 then
    return 0
  else
    tokens = tokens - 1
    redis.call('HMSET', key, 'tokens', tokens, 'timestamp', now)
    redis.call('EXPIRE', key, 3600)
    return 1
  end
`;
```

Raj ke project mein jaisa: **Redis-backed sliding window rate limiter using Lua scripts (ioredis)** for atomicity, with configurable `keyGenerator`, progressive penalty blocks, and **fail-open on Redis outage** (agar Redis down ho, rate limiting bypass ho jaye rather than blocking all traffic — availability > strictness).

---

# 16. Distributed Locks

Multiple servers/processes jab ek shared resource access karein, tab race condition rokne ke liye lock chahiye.

```bash
SET lock:resource1 "server-A-uuid" NX EX 10
```

- `NX` → sirf tab set ho jab key exist na kare (atomic check-and-set)
- `EX 10` → 10 second auto-expiry (deadlock se bachne ke liye — agar server crash ho jaye to lock apne aap release ho jayega)

```
Server A                     Redis                    Server B
   │                           │                          │
SET lock NX EX 10 ────────►  OK (lock acquired)           │
   │                           │                          │
   │ (processing...)           │       SET lock NX EX 10 ─┤
   │                           │       nil (lock busy) ◄──┘
   │                           │
DEL lock (release) ───────►  deleted
```

### Safe Release (sirf apna lock delete karo, kisi aur ka nahi — Lua script se atomic)

```js
const unlockScript = `
  if redis.call("GET", KEYS[1]) == ARGV[1] then
    return redis.call("DEL", KEYS[1])
  else
    return 0
  end
`;
// agar direct GET+DEL karoge (2 commands), beech mein TTL expire ho sakta hai
// aur dusra client lock le chuka ho sakta hai — us case mein tum uska lock delete kar dोge! (BUG)
// Isliye Lua script se atomic check+delete zaroori hai.
```

### Redlock Algorithm (multi-node Redis ke liye)
Jab Redis single instance nahi, multiple independent Redis nodes hon, to Redlock algorithm use hota hai — majority (N/2+1) nodes pe lock acquire karna padta hai taaki ek node fail hone se lock invalid na ho jaye.

**Use Cases:** Cron job duplicate-run prevention (multiple server instances mein sirf ek hi job chalaye), inventory deduction (2 users same last item na kharid le), payment processing idempotency

---

# 17. Leaderboard

Sorted Set (ZSet) leaderboard ke liye perfect data structure hai kyunki wo automatically score ke basis pe sorted rehta hai.

```bash
ZADD game:leaderboard 1500 "player1"
ZADD game:leaderboard 2300 "player2"
ZADD game:leaderboard 1800 "player3"

ZREVRANGE game:leaderboard 0 9 WITHSCORES    # top 10 players
ZREVRANK game:leaderboard "player1"           # player1 ka current rank
ZINCRBY game:leaderboard 100 "player1"        # score update (game jeetne pe)
ZSCORE game:leaderboard "player1"             # current score
```

```
Sorted Set (auto-sorted by score):
┌────────────┬───────┐
│ player2     │ 2300  │  Rank 1
│ player3     │ 1800  │  Rank 2
│ player1     │ 1500  │  Rank 3
└────────────┴───────┘
```

### Node.js Complete Example
```js
async function getLeaderboardWithRank(topN = 10) {
  const results = await redis.zrevrange("game:leaderboard", 0, topN - 1, "WITHSCORES");
  const leaderboard = [];
  for (let i = 0; i < results.length; i += 2) {
    leaderboard.push({ player: results[i], score: Number(results[i + 1]), rank: i / 2 + 1 });
  }
  return leaderboard;
}
```

**Time Complexity:** O(log N) for insert/update, O(log N + M) for range fetch — extremely scalable even with millions of players.

---

# 18. BullMQ (Queue + Worker System)

BullMQ ek Redis-backed job queue library hai Node.js ke liye. Ye Redis ke List, Sorted Set, aur Hash data structures internally use karta hai background jobs (email, PDF gen, notifications, video processing) ko reliably process karne ke liye.

## 18.1 Core Architecture

```
┌────────────┐      add(job)       ┌─────────────────┐      process       ┌────────────┐
│  Producer   │ ──────────────────► │  Redis Queue      │ ─────────────────► │  Worker(s)  │
│ (API server)│                     │ (Lists + ZSets +  │                    │ (background │
└────────────┘                     │  Hashes internally)│                    │  processes) │
                                     └─────────────────┘                    └──────┬─────┘
                                                                                    │
                                                                          ┌─────────┴─────────┐
                                                                          │  completed / failed │
                                                                          └────────────────────┘
```

### Internal Redis Structures BullMQ Use Karta Hai

```
bull:queueName:wait         → List (jobs waiting to be processed)
bull:queueName:active        → List (currently processing jobs)
bull:queueName:completed      → Sorted Set (score = completion timestamp)
bull:queueName:failed          → Sorted Set (score = failure timestamp)
bull:queueName:delayed          → Sorted Set (score = timestamp when job should run)
bull:queueName:priority           → Sorted Set (score = priority value)
bull:queueName:{jobId}              → Hash (actual job data + metadata)
bull:queueName:events                 → Stream (job lifecycle events)
```

## 18.2 Queue (Producer Side)

```js
const { Queue } = require("bullmq");

const emailQueue = new Queue("email-queue", {
  connection: { host: "127.0.0.1", port: 6379 },
});

// Basic job add
await emailQueue.add("send-welcome-email", {
  to: "raj@example.com",
  subject: "Welcome to AI Interview Prep!",
});

// Job with options
await emailQueue.add(
  "send-reminder",
  { userId: 101 },
  {
    delay: 60000,          // 60 sec baad process hoga
    attempts: 3,             // retry count
    backoff: { type: "exponential", delay: 5000 },
    priority: 1,               // lower number = higher priority
    removeOnComplete: true,      // success ke baad job data clean karo
    removeOnFail: 1000,            // sirf last 1000 failed jobs rakho
  }
);
```

## 18.3 Worker (Consumer Side)

```js
const { Worker } = require("bullmq");

const worker = new Worker(
  "email-queue",
  async (job) => {
    console.log(`Processing job ${job.id}: ${job.name}`);
    const { to, subject } = job.data;

    // actual work (send email via nodemailer/sendgrid)
    await sendEmail(to, subject);

    // progress update (optional)
    await job.updateProgress(100);

    return { status: "sent" }; // ye return value job.returnvalue mein store hoga
  },
  {
    connection: { host: "127.0.0.1", port: 6379 },
    concurrency: 5,   // ek saath 5 jobs parallel process honge
  }
);
```

```
Worker Concurrency = 5:
┌────┐┌────┐┌────┐┌────┐┌────┐
│Job1││Job2││Job3││Job4││Job5│   (5 jobs parallel processing)
└────┘└────┘└────┘└────┘└────┘
              ▼
   Job6, Job7... wait until a slot frees up
```

## 18.4 Job Lifecycle

```
        add()
          │
          ▼
      ┌────────┐
      │ WAITING │  (queue mein wait kar raha)
      └────┬───┘
           │  worker picks it up
           ▼
      ┌────────┐
      │ ACTIVE  │  (currently processing)
      └────┬───┘
           │
     ┌─────┴─────┐
     ▼           ▼
┌─────────┐  ┌────────┐
│COMPLETED │  │ FAILED  │
└─────────┘  └────┬───┘
                    │  agar attempts baaki hain
                    ▼
              ┌────────┐
              │ RETRY   │──► wapas WAITING/DELAYED mein jata hai
              └────────┘
```

### Job States Table

| State | Meaning |
|---|---|
| `waiting` | Queue mein hai, worker free hone ka wait |
| `active` | Currently worker processing kar raha |
| `completed` | Successfully process ho gaya |
| `failed` | Sab retries ke baad bhi fail |
| `delayed` | Future timestamp pe process hoga |
| `paused` | Queue paused hai, koi job process nahi ho raha |

## 18.5 Events

```js
const { QueueEvents } = require("bullmq");
const queueEvents = new QueueEvents("email-queue", { connection: redisConnection });

queueEvents.on("completed", ({ jobId, returnvalue }) => {
  console.log(`✅ Job ${jobId} completed:`, returnvalue);
});

queueEvents.on("failed", ({ jobId, failedReason }) => {
  console.log(`❌ Job ${jobId} failed:`, failedReason);
});

queueEvents.on("progress", ({ jobId, data }) => {
  console.log(`⏳ Job ${jobId} progress:`, data);
});

// Worker-level events (same process)
worker.on("completed", (job) => console.log(`Job ${job.id} done`));
worker.on("failed", (job, err) => console.log(`Job ${job.id} failed:`, err.message));
worker.on("active", (job) => console.log(`Job ${job.id} started`));
```

## 18.6 Delayed Jobs

Internally Redis **Sorted Set** use hota hai jisme score = timestamp jab job run karna hai. BullMQ ka internal scheduler is ZSet ko poll karta hai aur jab score (time) aa jaata hai, job ko `wait` list mein move kar deta hai.

```js
await emailQueue.add(
  "send-reminder",
  { userId: 101 },
  { delay: 3600000 } // 1 hour baad
);
```

```
Delayed Jobs (Sorted Set, score = execution timestamp)
┌───────────────┬──────────────────┐
│ job:reminder1  │ 1735689600000     │ ← jab time aayega, wait queue mein jayega
│ job:reminder2  │ 1735693200000     │
└───────────────┴──────────────────┘
```

## 18.7 Retry & Backoff

```js
await queue.add("risky-job", data, {
  attempts: 5,
  backoff: {
    type: "exponential",   // ya "fixed"
    delay: 2000,             // pehla retry 2s baad, phir 4s, 8s, 16s...
  },
});
```

```
Attempt 1 (fail) → wait 2s
Attempt 2 (fail) → wait 4s
Attempt 3 (fail) → wait 8s
Attempt 4 (fail) → wait 16s
Attempt 5 (fail) → moved to "failed" state permanently
```

Custom backoff strategy bhi bana sakte ho:
```js
const worker = new Worker("queue", processor, {
  connection,
  settings: {
    backoffStrategy: (attemptsMade) => attemptsMade * 3000, // custom logic
  },
});
```

## 18.8 Priority

```js
await queue.add("urgent-task", data, { priority: 1 });   // highest priority
await queue.add("normal-task", data, { priority: 10 });   // lower priority
```

Internally priority bhi Sorted Set (score = priority value) se manage hota hai — lower number pehle process hota hai.

## 18.9 Repeatable Jobs (Cron-like)

```js
await queue.add(
  "daily-report",
  { type: "summary" },
  {
    repeat: {
      pattern: "0 9 * * *",  // cron syntax — har din 9 AM
      // OR: every: 3600000  // simple interval (ms)
    },
  }
);
```

```
Repeatable Job Scheduler:
┌────────────────────────────────────┐
│  Cron: "0 9 * * *"                  │
│  Har din 9:00 AM naya job trigger    │
│  hota hai automatically              │
└────────────────────────────────────┘
```

## 18.10 QueueScheduler (Older BullMQ) / Built-in Scheduler (Newer)

Purane BullMQ versions mein alag se `QueueScheduler` chalana padta tha jo delayed jobs ko waiting state mein move karta tha aur stalled jobs ko detect karta tha. Newer versions (v4+) mein ye functionality Worker ke andar hi built-in hai.

**Stalled Jobs:** Agar worker crash ho jaye job process karte waqt (job "active" state mein hi reh gaya), scheduler use detect karke automatically retry list mein daal deta hai.

```js
const worker = new Worker("queue", processor, {
  connection,
  lockDuration: 30000,      // job ko kitni der tak "locked" (active) maana jaye
  stalledInterval: 30000,    // kitni frequently stalled jobs check karo
  maxStalledCount: 1,           // max kitni baar ek job stall ho sakta hai retry se pehle
});
```

## 18.11 Complete Real-World Example: Email Queue System

```js
// queue.js
const { Queue } = require("bullmq");
const connection = { host: "127.0.0.1", port: 6379 };

const emailQueue = new Queue("email-queue", { connection });

module.exports = { emailQueue };

// producer.js (e.g. inside a signup controller)
const { emailQueue } = require("./queue");

app.post("/signup", async (req, res) => {
  const user = await createUser(req.body);
  await emailQueue.add("welcome-email", { email: user.email, name: user.name }, {
    attempts: 3,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: true,
  });
  res.json({ message: "Signup successful, welcome email queued" });
});

// worker.js (separate process — run with: node worker.js)
const { Worker } = require("bullmq");
const nodemailer = require("nodemailer");

const worker = new Worker(
  "email-queue",
  async (job) => {
    const { email, name } = job.data;
    const transporter = nodemailer.createTransport({ /* smtp config */ });
    await transporter.sendMail({
      to: email,
      subject: `Welcome ${name}!`,
      text: "Thanks for signing up!",
    });
    return { sent: true, to: email };
  },
  { connection: { host: "127.0.0.1", port: 6379 }, concurrency: 10 }
);

worker.on("completed", (job) => console.log(`✅ Email sent for job ${job.id}`));
worker.on("failed", (job, err) => console.error(`❌ Email failed for job ${job.id}:`, err.message));
```

## 18.12 BullMQ Architecture: Multiple Workers (Horizontal Scaling)

```
                          ┌─────────────────┐
                          │  Redis Queue      │
                          │  (single source   │
                          │   of truth)        │
                          └─────────┬─────────┘
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
       ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
       │  Worker Node1 │     │  Worker Node2│     │  Worker Node3│
       │  (Server A)   │     │  (Server B)  │     │  (Server C)  │
       └─────────────┘     └─────────────┘     └─────────────┘

Jobs automatically distribute hote hain workers ke beech (whoever free hai, wo next job pick karta hai)
Isse horizontal scaling easy — bas naye worker process/server add karo
```

## 18.13 Common Mistakes (Interview mein poocha jata hai)

| Mistake | Fix |
|---|---|
| `maxRetriesPerRequest` default set na karna | BullMQ ke connection mein `maxRetriesPerRequest: null` set karo |
| Worker aur Queue same Redis connection object share karna | Alag connections use karo (blocking commands conflict karte hain) |
| `removeOnComplete`/`removeOnFail` set na karna | Redis memory bloat ho jayega lakhon completed jobs se |
| Job processor mein error throw na karna (silently fail) | Errors throw karo taaki BullMQ retry trigger kare |
| Concurrency bahut high rakhna without rate consideration | External API rate limits ka dhyan rakhte hue concurrency set karo |

## 18.14 BullMQ Command Summary Table

| Method | Purpose |
|---|---|
| `queue.add(name, data, opts)` | Naya job add karo |
| `queue.addBulk([...])` | Multiple jobs ek saath add karo |
| `queue.getJob(id)` | Specific job fetch karo |
| `queue.getJobs(['waiting','active'])` | Status ke basis pe jobs list karo |
| `queue.pause()` / `queue.resume()` | Queue pause/resume karo |
| `queue.drain()` | Saari waiting jobs remove karo |
| `queue.obliterate()` | Poori queue destroy karo (⚠️ dangerous) |
| `job.remove()` | Specific job delete karo |
| `job.retry()` | Failed job ko manually retry karo |
| `job.updateProgress(n)` | Progress percentage update karo |
| `worker.close()` | Worker gracefully band karo |

---

# 19. Redis Streams (Deep Dive)

Streams append-only log data structure hai (Kafka jaisa) — messaging + event sourcing ke liye. BullMQ khud internally job events ke liye streams use karta hai.

```
Stream: "orders"
┌──────────────────┬──────────────────────────┐
│ 1735689600000-0   │ orderId=101 status=placed │
│ 1735689601000-0   │ orderId=102 status=placed │
│ 1735689605000-0   │ orderId=101 status=paid    │
└──────────────────┴──────────────────────────┘
     ID = timestamp-sequence (auto-generated)
```

```bash
XADD orders '*' orderId 101 status "placed"    # '*' = auto-generate ID
XLEN orders
XRANGE orders - +                                 # sab entries
XREAD COUNT 10 STREAMS orders 0                    # beginning se 10 entries
XREAD BLOCK 5000 STREAMS orders $                   # naye entries ka wait (blocking, 5 sec)
```

### Consumer Groups (multiple consumers, load balanced)

```
                     Stream: "orders"
                          │
              ┌───────────┴───────────┐
              ▼                       ▼
     ┌─────────────────┐    ┌─────────────────┐
     │ Consumer Group:   │    │ Consumer Group:   │
     │ "order-processors" │    │ "analytics-team"   │
     ├─────────┬─────────┤    └─────────────────┘
     ▼         ▼         ▼
  Consumer1 Consumer2 Consumer3
  (each gets different messages — load balanced within group)
```

```bash
XGROUP CREATE orders order-processors 0
XREADGROUP GROUP order-processors consumer-1 COUNT 5 STREAMS orders '>'
XACK orders order-processors 1735689600000-0    # message process ho gaya, acknowledge karo
XPENDING orders order-processors                  # jo messages pending hain (ack nahi hui)
```

### Streams vs Pub/Sub vs BullMQ

| Feature | Pub/Sub | Streams | BullMQ |
|---|---|---|---|
| Persistence | ❌ No | ✅ Yes | ✅ Yes |
| Consumer groups | ❌ No | ✅ Yes | ✅ Yes (via workers) |
| Retry/Ack | ❌ No | ✅ Yes (XACK) | ✅ Yes (built-in) |
| Job scheduling/delay | ❌ No | ❌ Manual | ✅ Built-in |
| Priority/backoff | ❌ No | ❌ Manual | ✅ Built-in |
| Best for | Real-time broadcast | Event log / event sourcing | Background job processing |

---

# 20. Redis Cluster

Data ko multiple nodes ke beech automatically **shard** (partition) karta hai — horizontal scaling ke liye.

```
                    16384 Hash Slots (total)
     ┌──────────────────┬──────────────────┬──────────────────┐
     │  Slots 0-5460      │  Slots 5461-10922  │  Slots 10923-16383│
     │  Node A (Master)    │  Node B (Master)    │  Node C (Master)    │
     │  + Node A-Replica    │  + Node B-Replica    │  + Node C-Replica    │
     └──────────────────┴──────────────────┴──────────────────┘

Key kis node pe jayegi? → CRC16(key) % 16384 = slot number → us slot wale node pe
```

```bash
redis-cli --cluster create \
  127.0.0.1:7000 127.0.0.1:7001 127.0.0.1:7002 \
  127.0.0.1:7003 127.0.0.1:7004 127.0.0.1:7005 \
  --cluster-replicas 1
```

```js
const Redis = require("ioredis");
const cluster = new Redis.Cluster([
  { host: "127.0.0.1", port: 7000 },
  { host: "127.0.0.1", port: 7001 },
  { host: "127.0.0.1", port: 7002 },
]);
```

**Hash Tags:** Agar multiple keys ek hi node pe rakhni ho (jaise multi-key operations ke liye), curly braces use karo:
```
user:{1000}:profile
user:{1000}:settings
// Dono keys "1000" ke basis pe hash hongi, isliye same slot/node pe jayengi
```

**Fayde:** Horizontal scaling (RAM limit ek node se bahut zyada data), automatic failover (replica promote ho jata hai agar master down ho)
**Nuksan:** Multi-key operations (jaise MGET cross-slot keys pe) complex ho jaate hain, setup/maintenance complexity badh jaati hai

---

# 21. Replication

Master-Replica (pehle Master-Slave kehte the) architecture — data redundancy aur read scaling ke liye.

```
                  ┌──────────┐
                  │  MASTER   │  (writes yahin hote hain)
                  └────┬─────┘
          ┌────────────┼────────────┐
          ▼             ▼             ▼
    ┌──────────┐  ┌──────────┐  ┌──────────┐
    │ Replica 1  │  │ Replica 2  │  │ Replica 3  │  (reads yahan se, read scaling)
    └──────────┘  └──────────┘  └──────────┘

Replication: Asynchronous (default) — master apna data replicas ko background mein bhejta hai
```

```bash
# Replica config
REPLICAOF 127.0.0.1 6379
# ya redis.conf mein: replicaof <master-ip> <master-port>
```

**Kyun use karein?**
- **Read scaling:** Reads ko replicas pe distribute karo, master sirf writes handle kare
- **High availability:** Master crash ho to replica ko promote kar sakte ho
- **Backup:** Replica se backup lo bina master pe load daale

**Replication Lag:** Async hone ki wajah se replica thoda "peeche" ho sakta hai master se (usually milliseconds, but network issues mein badh sakta hai) — isliye critical reads (jaise turant likhi hui value) master se hi karo.

---

# 22. Sentinel

Automatic failover system — Master down hone pe khud detect karke ek Replica ko naya Master banata hai.

```
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ Sentinel 1    │   │ Sentinel 2    │   │ Sentinel 3    │   (quorum-based monitoring)
└──────┬──────┘   └──────┬──────┘   └──────┬──────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                             ▼
                     Monitor Master + Replicas
                             │
                   Master DOWN detected!
                             │
                             ▼
              Elect new Master from Replicas
                             │
                             ▼
              Reconfigure other Replicas + notify clients
```

**Kaam:**
1. **Monitoring:** Master aur Replicas ki health continuously check karta hai
2. **Notification:** Kisi component ke fail hone pe admin/apps ko notify karta hai
3. **Automatic Failover:** Master fail hone pe ek Replica ko naya Master banata hai
4. **Configuration Provider:** Clients Sentinel se pooch sakte hain "current master kaun hai"

```js
const redis = new Redis({
  sentinels: [
    { host: "127.0.0.1", port: 26379 },
    { host: "127.0.0.1", port: 26380 },
    { host: "127.0.0.1", port: 26381 },
  ],
  name: "mymaster", // sentinel config mein defined master group name
});
```

**Quorum:** Minimum sentinels jo agree karein ki master down hai, tabhi failover trigger hoga (split-brain se bachne ke liye — jaise agar sirf 1 sentinel network issue ki wajah se master ko down samjhe, to galat failover na ho).

### Cluster vs Sentinel vs Replication — Quick Comparison

| | Replication | Sentinel | Cluster |
|---|---|---|---|
| Purpose | Data copy, read scaling | Auto-failover | Data sharding (horizontal scale) |
| Auto-failover | ❌ Manual | ✅ Yes | ✅ Yes |
| Data sharding | ❌ No (full copy each node) | ❌ No | ✅ Yes |
| Complexity | Low | Medium | High |

---

# 23. Memory Optimization

```bash
CONFIG SET maxmemory 500mb
CONFIG SET maxmemory-policy allkeys-lru
MEMORY USAGE mykey            # ek key kitni memory le rahi hai
MEMORY DOCTOR                  # Redis khud suggestions deta hai
```

### Tips
1. **Use Hashes for small objects** — 100 fields tak, Hash listpack encoding se bahut compact hota hai vs 100 alag String keys
2. **Set TTL hamesha** — bina expiry ke keys memory leak create karte hain
3. **Avoid huge values** — bade JSON blobs ki jagah zaroori fields hi cache karo
4. **Use appropriate data types** — Bitmap/HyperLogLog jaise memory-efficient structures use karo jab possible ho
5. **Compress large values** — application level pe gzip karke store karo agar values bade hain
6. **Monitor with `INFO memory`** — `used_memory`, `used_memory_peak`, `mem_fragmentation_ratio` track karo

```bash
INFO memory
# used_memory_human:120.5M
# maxmemory_human:500.0M
# mem_fragmentation_ratio:1.15   (1.0-1.5 healthy, >1.5 fragmentation issue)
```

### Ziplist/Listpack Thresholds (small collections auto-compact hote hain)

```bash
hash-max-listpack-entries 128
hash-max-listpack-value 64
list-max-listpack-size 128
set-max-intset-entries 512
zset-max-listpack-entries 128
```

Agar collection in limits ke andar hai, Redis compact encoding use karta hai (kam memory). Limit cross karte hi standard hashtable/skiplist mein convert ho jata hai (zyada memory, but O(1)/O(log N) guarantees).

---

# 24. Production Best Practices

1. **Connection pooling** — ek hi Redis client instance reuse karo, har request pe naya connection mat banao
2. **`maxRetriesPerRequest: null`** — BullMQ ke liye zaroori (warna infinite jobs ke intezaar mein queue crash)
3. **Alag Redis instance for Cache vs Queue vs Session** (agar scale bada hai) — taaki ek heavy workload dusre ko impact na kare
4. **Never use `KEYS *` in production** — `SCAN` use karo
5. **Set `maxmemory` + eviction policy** — unbounded memory growth se bachne ke liye
6. **Enable AOF + RDB hybrid persistence** for production durability
7. **Use `NX`/`EX` together for locks** — atomic operation, race condition-proof
8. **Monitor with `INFO`, `SLOWLOG`, RedisInsight/Grafana**
```bash
SLOWLOG GET 10      # last 10 slow commands dekho
CONFIG SET slowlog-log-slower-than 10000   # 10ms se zyada lene wale commands log karo
```
9. **Graceful shutdown** — Worker/Queue connections ko `close()` se properly band karo app shutdown pe
10. **Use environment-based config** — password, host, port kabhi hardcode mat karo
11. **Namespace your keys** — `app:feature:id` pattern follow karo (jaise `user:1:profile`, `session:abc123`)
12. **Avoid `FLUSHALL`/`FLUSHDB` in production scripts** without explicit confirmation guard
13. **Set appropriate `lockDuration` in BullMQ workers** matching your job's expected processing time
14. **Use Redis ACLs** for fine-grained permission control in multi-team environments

```bash
# Production redis.conf essentials
maxmemory 2gb
maxmemory-policy allkeys-lru
appendonly yes
appendfsync everysec
save 900 1
requirepass "strong-password-here"
bind 127.0.0.1 -::1
protected-mode yes
```

---

# 25. Interview Questions Bank

**Basics**
1. Redis single-threaded kyun hai, aur ye performance ke liye achha kaise hai?
2. Redis ke andar String ka internal representation (SDS) kya hai, aur C string se better kyun hai?
3. RDB aur AOF mein kya difference hai? Production mein kaunsa use karna chahiye?
4. Redis expiration internally kaise kaam karta hai (active vs passive)?

**Data Structures**
5. List vs Set vs Sorted Set — kab kaunsa use karoge?
6. Sorted Set internally kis data structure pe based hai aur kyun?
7. HyperLogLog kaise itni kam memory mein unique count karta hai?
8. Hash vs multiple String keys — memory aur performance ke hisab se comparison karo.

**Caching**
9. Cache-aside aur write-through mein kya difference hai?
10. Cache stampede/thundering herd problem kya hai aur ise kaise solve karoge? (Hint: lock/mutex, request coalescing, ya staggered TTL)
11. Cache invalidation strategies kya-kya ho sakti hain?

**Concurrency & Locking**
12. Redis transactions (MULTI/EXEC) SQL transactions se kaise different hain?
13. Distributed lock implement karne mein kya challenges hain? Redlock algorithm kya solve karta hai?
14. Race condition kaise avoid karoge jab dono `SET NX` aur TTL involve ho?

**BullMQ**
15. BullMQ internally Redis ke kaunse data structures use karta hai delayed jobs ke liye?
16. Stalled job kya hota hai aur BullMQ ise kaise handle karta hai?
17. Retry with exponential backoff kaise implement karoge?
18. Priority queue BullMQ mein internally kaise kaam karta hai?
19. Concurrency setting worker mein kya control karti hai?

**Scaling**
20. Redis Cluster mein data sharding kaise hoti hai (hash slots)?
21. Sentinel aur Cluster mein kya farak hai?
22. Replication lag kya hota hai aur ye kab problem create kar sakta hai?

**Scenario-based**
23. Tumhare paas ek high-traffic API hai jisme same key baar-baar heavily read ho rahi hai — kaise optimize karoge?
24. Ek distributed system mein tumhe ek unique job ko sirf ek hi baar (idempotently) process karna hai — kaise ensure karoge Redis se?
25. Agar Redis down ho jaye production mein achanak, tumhara system kaise gracefully degrade karega (fail-open vs fail-closed strategy)?

---

# 26. Complete MERN Examples

## 26.1 OTP Verification System

```js
// Send OTP
app.post("/send-otp", async (req, res) => {
  const { phone } = req.body;
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  await redis.setex(`otp:${phone}`, 300, otp); // 5 min expiry
  // send via SMS gateway...
  res.json({ message: "OTP sent" });
});

// Verify OTP
app.post("/verify-otp", async (req, res) => {
  const { phone, otp } = req.body;
  const storedOtp = await redis.get(`otp:${phone}`);
  if (!storedOtp) return res.status(400).json({ error: "OTP expired" });
  if (storedOtp !== otp) return res.status(400).json({ error: "Invalid OTP" });
  await redis.del(`otp:${phone}`); // one-time use
  res.json({ message: "Verified" });
});
```

## 26.2 Cache Layer for Express + MongoDB

```js
async function getProductWithCache(req, res) {
  const { id } = req.params;
  const cacheKey = `product:${id}`;

  const cached = await redis.get(cacheKey);
  if (cached) {
    return res.json({ source: "cache", data: JSON.parse(cached) });
  }

  const product = await Product.findById(id);
  if (!product) return res.status(404).json({ error: "Not found" });

  await redis.setex(cacheKey, 1800, JSON.stringify(product)); // 30 min
  res.json({ source: "db", data: product });
}
```

## 26.3 Background PDF Generation (Resume Builder pattern — jaisa Raj ke AI-Interview-Prep project mein hai)

```js
// queue.js
const resumeQueue = new Queue("resume-pdf-generation", { connection });

// controller.js
app.post("/generate-resume", async (req, res) => {
  const job = await resumeQueue.add("build-resume", {
    userId: req.user.id,
    resumeData: req.body,
  });
  res.json({ jobId: job.id, status: "queued" });
});

app.get("/resume-status/:jobId", async (req, res) => {
  const job = await resumeQueue.getJob(req.params.jobId);
  if (!job) return res.status(404).json({ error: "Job not found" });
  const state = await job.getState();
  res.json({ state, result: job.returnvalue });
});

// worker.js
const worker = new Worker(
  "resume-pdf-generation",
  async (job) => {
    const { resumeData } = job.data;
    const pdfBuffer = await generatePdfWithPuppeteer(resumeData);
    const url = await uploadToS3(pdfBuffer);
    return { pdfUrl: url };
  },
  { connection, concurrency: 3 }
);
```

## 26.4 Distributed Lock for Payment Idempotency

```js
async function processPayment(orderId, amount) {
  const lockKey = `lock:payment:${orderId}`;
  const lockValue = crypto.randomUUID();

  const acquired = await redis.set(lockKey, lockValue, "NX", "EX", 30);
  if (!acquired) {
    throw new Error("Payment already being processed for this order");
  }

  try {
    // actual payment gateway call
    await paymentGateway.charge(orderId, amount);
  } finally {
    const unlockScript = `
      if redis.call("GET", KEYS[1]) == ARGV[1] then
        return redis.call("DEL", KEYS[1])
      else
        return 0
      end
    `;
    await redis.eval(unlockScript, 1, lockKey, lockValue);
  }
}
```

---

# 27. Cheat Sheet

## Quick Command Reference

| Category | Command | Purpose |
|---|---|---|
| String | `SET k v EX 60` | Set with 60s TTL |
| String | `INCR k` | Atomic increment |
| List | `LPUSH`/`RPUSH` | Insert head/tail |
| List | `BLPOP k 0` | Blocking pop |
| Set | `SADD`/`SISMEMBER` | Add/check membership |
| ZSet | `ZADD k score member` | Add with score |
| ZSet | `ZREVRANGE k 0 9 WITHSCORES` | Top 10 |
| Hash | `HSET`/`HGETALL` | Object storage |
| Key | `EXPIRE k 60` / `TTL k` | Expiry management |
| Key | `SCAN 0 MATCH pattern` | Safe key iteration |
| Transaction | `MULTI ... EXEC` | Atomic batch |
| Lock | `SET k v NX EX 10` | Distributed lock |
| Pub/Sub | `PUBLISH`/`SUBSCRIBE` | Real-time messaging |
| Stream | `XADD`/`XREAD`/`XACK` | Event log |

## BullMQ Quick Reference

```js
// Producer
const queue = new Queue("name", { connection });
await queue.add("jobName", data, { attempts: 3, delay: 5000, priority: 1 });

// Consumer
const worker = new Worker("name", async (job) => { /* process */ }, { connection, concurrency: 5 });
worker.on("completed", (job) => {});
worker.on("failed", (job, err) => {});
```

## Time Complexity Cheat Sheet

| Command | Complexity |
|---|---|
| GET/SET | O(1) |
| INCR | O(1) |
| LPUSH/RPUSH/LPOP/RPOP | O(1) |
| LRANGE | O(S+N) |
| SADD/SISMEMBER | O(1) |
| ZADD/ZRANK | O(log N) |
| ZRANGE | O(log N + M) |
| HSET/HGET | O(1) |
| HGETALL | O(N) |
| KEYS * | O(N) — avoid! |
| SCAN | O(1) per call (cursor-based) |

## Decision Flowchart: Which Redis Tool to Use?

```
Need speed layer over DB? ──────────────► Caching (Cache-aside pattern)
Need background job processing? ────────► BullMQ (Queue + Worker)
Need real-time broadcast (no persist)? ─► Pub/Sub
Need reliable event log (persist)? ─────► Streams
Need ranking/leaderboard? ───────────────► Sorted Set
Need unique visitor count (approx)? ─────► HyperLogLog
Need per-user daily tracking? ───────────► Bitmap
Need distributed mutual exclusion? ──────► SET NX EX + Lua unlock script
Need shared session across servers? ─────► Hash / String with TTL
Need horizontal scaling (huge dataset)? ─► Redis Cluster
Need auto-failover (HA)? ────────────────► Sentinel
```

---

## 🎯 Final Notes

- Ye document interview revision ke liye ek complete reference hai — har topic ko internal working + practical Node.js code ke saath cover kiya gaya hai.
- BullMQ section especially detailed hai kyunki ye Raj ke AI-Interview-Prep aur agency projects mein directly use hota hai (background jobs, email queue, PDF generation).
- Production mein jaate waqt hamesha: connection reuse, TTL discipline, `SCAN` over `KEYS`, aur proper error handling/retry strategy follow karo.

**Happy Revising! 🚀**