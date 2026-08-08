# Episode 10: Docker Compose

## Introduction

---

## Brick 1: Problem Ko Recap Karte Hain


Agar kal tumhe frontend bhi add karna ho, ek chauthi lambi command aur. Aur agar tumhe kisi doosre computer pe **exact wahi setup** chalana ho, tumhe yeh saari commands **yaad rakhni** padegi, ya kahin likh ke rakhni padegi.

**Yeh messy hai. Iska solution hai — sab kuch ek file mein likh dena.**

---

## Brick 2: Docker Compose Kya Hai

### Story Time: Orchestra Ka Conductor

Socho ek orchestra hai jisme 10 alag musicians hain — violin, drums, piano, sab apna-apna instrument bajate hain. Agar har musician **apni marzi se, alag time pe** bajaye, sirf shor hoga, music nahi banega.

Isliye orchestra mein ek **conductor** hota hai — ek insaan jo sabko ek saath, sahi timing pe, sahi tareeke se coordinate karta hai. Conductor ke paas ek **sheet music** (written plan) hota hai jisme likha hai kaun kab bajayega.

**Docker Compose bilkul yeh conductor hai.** Yeh ek tool hai jo **multiple containers ko ek saath, coordinated tareeke se** start, stop, aur manage karta hai — ek single configuration file ke through.

Yeh configuration file **sheet music** ki tarah hai — jismein likha hota hai kaunse containers chahiye, unki settings kya hain, kaise woh ek doosre se connected hain. Iska naam hota hai `docker-compose.yml`.

---

## Brick 3: YAML Format Samajhna

Compose file **YAML** format mein likhi jaati hai. Yeh JSON jaisa hi hai (agar tumne dekha ho), lekin **indentation (spacing)** se structure banata hai, curly braces ki jagah.

> **Important Point:** YAML mein **spacing bahut zaroori hai**. Agar tumne galat jagah space diya, poori file kaam nahi karegi. Hamesha **spaces** use karo, **Tab key nahi** — yeh sabse common galti hai jo beginners karte hain.

---

## Brick 4: Apna Pehla docker-compose.yml Likhते Hain

Chalo wahi backend + database wala setup, ab Compose file mein likhते hain:

```yaml
version: "3.8"

services:
  backend:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - db
    networks:
      - app-network

  db:
    image: mysql
    environment:
      MYSQL_ROOT_PASSWORD: password123
    volumes:
      - db-data:/var/lib/mysql
    networks:
      - app-network

networks:
  app-network:

volumes:
  db-data:
```

Chalo isko brick by brick todte hain.

### services — Har Container Ka Naam

```yaml
services:
  backend:
  db:
```

`services` ke andar, hum har container ko ek naam dete hain — yahan `backend` aur `db`. Yeh naam automatically container ka naam bhi ban jaata hai, aur Networking mein hum isi naam se ek doosre ko refer kar sakenge (jaise pichle episode mein `host: "db"`).

### build vs image

```yaml
backend:
  build: .
```

`build: .` batata hai — "is folder mein jo Dockerfile hai, uske through Image banao." Yeh humari apni custom Image ke liye use hota hai.

```yaml
db:
  image: mysql
```

`image: mysql` batata hai — "seedha Docker Hub se yeh ready-made Image use karo." Yeh readymade Images ke liye use hota hai.

### ports — Port Mapping

```yaml
ports:
  - "3000:3000"
```

Yeh wahi `-p 3000:3000` hai jo humne pehle `docker run` mein use kiya tha, bas ab YAML format mein.

### environment — Environment Variables

```yaml
environment:
  MYSQL_ROOT_PASSWORD: password123
```

Yeh wahi `-e MYSQL_ROOT_PASSWORD=password123` hai, YAML format mein.

### volumes — Data Persist Karna

```yaml
volumes:
  - db-data:/var/lib/mysql
```

Yeh wahi Volume wala concept hai jo humne seekha tha, ab yahan define ho raha hai. Neeche, file ke aakhir mein, humein is Volume ko **declare** bhi karna hota hai:

```yaml
volumes:
  db-data:
```

### depends_on — Order Set Karna

```yaml
backend:
  depends_on:
    - db
```

Yeh batata hai — "backend ko start karne se pehle, `db` ko start karo." Yeh zaroori hai kyunki backend ko database ki zaroorat hogi connect hote waqt.

> **Important Point:** `depends_on` sirf **start hone ka order** control karta hai — yeh guarantee nahi karta ki database **poori tarah ready** hai connections lene ke liye (kabhi-kabhi database start toh ho jaata hai, lekin thodi der leta hai fully ready hone mein). Real production apps mein, iske liye extra "retry logic" bhi likha jaata hai — abhi ke liye, humare basic use case ke liye, `depends_on` kaafi hai.

---

## Brick 5: Compose Ko Chalana

Ab poora setup, **sirf ek command** se chalta hai:

```bash
docker-compose up
```

Yeh command Compose file padhega, saare zaroori Images build/pull karega, Network aur Volume banayega, aur **saare containers ko sahi order mein start** karega.

Background mein chalane ke liye:

```bash
docker-compose up -d
```

### Sab Kuch Band Karna

```bash
docker-compose down
```

Yeh saare containers ko stop aur remove kar deta hai (lekin Volumes safe rehte hain, jab tak tum explicitly `-v` flag na do delete karne ke liye).

```bash
docker-compose down -v
```

Yeh Volumes bhi delete kar dega — **dhyan se use karna**, isse data permanently jaata rahega.

---

## Brick 6: Poora Farak — Pehle vs Ab

Chalo dekhते hain kitna simplify ho gaya:

**Pehle (Docker Commands se):**
```bash
docker network create app-network
docker run -d --name db --network app-network -e MYSQL_ROOT_PASSWORD=password123 -v db-data:/var/lib/mysql mysql
docker run -d --name backend --network app-network -p 3000:3000 mera-app
```

**Ab (Docker Compose se):**
```bash
docker-compose up -d
```

**Ek command, poora setup.** Aur agar tumhe kisi doosre computer pe, ya apni team ke saath, yeh setup share karna hai, tumhe bas ek `docker-compose.yml` file bhejni hai — koi lambi commands yaad rakhne ki zaroorat nahi.

---

## Brick 7: Real World Mein Company Kahan Use Karti Hai

- **Local Development** — almost har team, jab local machine pe kaam karti hai, Docker Compose use karti hai apna poora setup (backend, database, cache, waghera) ek command se chalane ke liye
- **Small-to-Medium Deployments** — chhoti aur medium companies apne production servers pe bhi Docker Compose use karti hain, jab unhe bahut bade, complex orchestration (jaise Kubernetes) ki zaroorat nahi hoti
- **Onboarding** — jab naya developer team join karta hai, unhe manually 10 alag software install nahi karne padte — bas `docker-compose up` chalate hi, poora development environment ready ho jaata hai

---

## Recap — Jo Aaj Seekha

- **Docker Compose** ek "conductor" hai jo multiple containers ko ek **single configuration file** se coordinate karta hai
- `docker-compose.yml` — YAML format mein likhi file, jismein saare services define hote hain
- `services` — har container define karna, `build` (custom Image) ya `image` (ready-made Image) se
- `ports`, `environment`, `volumes`, `networks` — sab wahi settings jo humne `docker run` mein dekhi thi, ab YAML format mein
- `depends_on` — containers start hone ka order set karna
- `docker-compose up -d` — poora setup ek command se chalu karna
- `docker-compose down` — poora setup band karna

---

## Aage Kya

Agle episode mein hum yeh sab kuch practically ek **real MERN stack project** pe apply karenge — poora ek app (React frontend + Node backend + MongoDB) dockerize karenge, Compose ke saath.

Agar aaj ka concept clear hua, like zaroor karna, aur agar kahin doubt hai, comment mein pooch lena.

Milte hain agle episode mein. Tab tak keep coding.