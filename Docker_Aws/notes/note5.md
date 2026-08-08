# Episode 5: Basic Docker Commands

## Introduction

Bhai pichle episode mein humne Image vs Container samjha, aur kuch commands bhi dekhe — `docker images`, `docker run`, `docker ps`. Aaj hum in commands ko aur detail mein practice karenge, aur kuch naye seekhenge jo roz-roz kaam aayenge — container ko **stop karna, delete karna, uske andar jhaankna, aur uske logs dekhna**.

Yeh episode poora **hands-on** hai. Chalo shuru karte hain.

---

## Brick 1: docker run — Ek Container Start Karna

Humne yeh command pehle bhi dekhi hai, lekin chalo isse thoda detail mein samajhte hain, kyunki isme kayi useful options hain.

### Story Time: Naya Tenant Ghar Mein Le Aana

Socho tum ek naye tenant ko ghar mein le aa rahe ho (naye naksha se ghar bana ke). `docker run` bilkul yehi karta hai — Image (naksha) leke, ek naya Container (ghar) banata hai, aur usse **turant chalu bhi kar deta hai**.

Chalo ek real example dekhte hain — ek `nginx` web server chalate hain:

```bash
docker run nginx
```

Agar tum yeh command chalao, terminal **block ho jaayega** — matlab tum aur kuch type nahi kar paoge, jab tak container chal raha hai. Yeh isliye hota hai kyunki by default, container **"foreground"** mein chalta hai — matlab terminal ke saamne, tumhare control mein.

### -d Flag — Background Mein Chalana

Zyadatar time, hum chahte hain container **background mein chale**, taaki humara terminal free rahe. Iske liye:

```bash
docker run -d nginx
```

`-d` ka matlab hai **"detached"** — matlab container terminal se "alag" ho jaata hai, background mein chalta rehta hai, aur humein turant terminal wapas mil jaata hai use karne ke liye.

### --name Flag — Naam Dena

Har container ko Docker automatically ek **random naam** deta hai (jaise `happy_einstein` ya `brave_curie` — haan, Docker funny random naam deta hai!). Lekin yeh yaad rakhna mushkil hota hai. Isliye hum apna khud ka naam de sakte hain:

```bash
docker run -d --name mera-server nginx
```

Ab is container ko humesha `mera-server` naam se refer kar sakte hain.

### -p Flag — Port Connect Karna

Yeh ek bahut important flag hai. Socho `nginx` ek web server hai — matlab yeh ek website serve karta hai. Lekin yeh website **container ke andar** chal rahi hai — humare browser se seedha access nahi ho sakti, jab tak hum ek "raasta" (port) na banayein.

```bash
docker run -d --name mera-server -p 8080:80 nginx
```

`-p 8080:80` ka matlab hai — "mere computer ka port 8080, container ke andar ke port 80 se connect kar do." Ab agar tum browser mein `localhost:8080` khologe, tumhe nginx ki default webpage dikhegi!

### Story Time: Do Number Wala Darwaza

Isko aise socho — container ek ghar hai jiska apna darwaza number hai (yahan `80`). Lekin yeh ghar ek gated colony ke andar hai, jahan bahar se seedha nahi pahuncha ja sakta. `-p 8080:80` matlab colony ke gate pe ek naya number `8080` assign karna, jo seedha us ghar ke `80` number wale darwaze tak le jaaye.

---

## Brick 2: docker ps — Kaunse Containers Chal Rahe Hain

Yeh humne pichle episode mein dekha tha, chalo revise karte hain:

```bash
docker ps
```

Yeh dikhata hai **saare currently running containers**. Output mein important columns hote hain:

```
CONTAINER ID   IMAGE   STATUS          PORTS                   NAMES
a1b2c3d4e5     nginx   Up 5 minutes    0.0.0.0:8080->80/tcp    mera-server
```

- **CONTAINER ID** — har container ka unique ID
- **STATUS** — kitni der se chal raha hai
- **PORTS** — kaunsa port mapping set hai
- **NAMES** — humne diya hua naam (ya random naam agar humne nahi diya)

Sab containers dekhne ke liye, chahe band ho chuke hon:

```bash
docker ps -a
```

---

## Brick 3: docker stop — Container Ko Rokna

Ab socho tumhe container ko **band** karna hai, lekin **delete nahi karna**. Jaise ghar mein bijli off kar dena, lekin ghar wahi rehta hai, bas active nahi hai.

```bash
docker stop mera-server
```

Tum container ka **naam** ya **ID**, dono use kar sakte ho. Container gracefully stop ho jaata hai (matlab usse thoda time diya jaata hai apna kaam sahi se band karne ke liye, achanak se bandh nahi kiya jaata).

Ab agar `docker ps` chalao, yeh container **nahi dikhega** (kyunki woh running nahi hai). Lekin `docker ps -a` chalane pe, woh dikhega, status "Exited" ke saath.

### docker start — Wapas Chalu Karna

Agar tumhe stopped container ko **wapas chalu** karna hai:

```bash
docker start mera-server
```

Yeh usi container ko wapas se start kar dega — koi naya container nahi banega, wahi purana wala chalu ho jaayega, apne saare data ke saath.

---

## Brick 4: docker rm — Container Ko Permanently Delete Karna 

Ab socho tumhe container ki bilkul zaroorat nahi hai, tum ise **permanently hata dena** chahte ho. Iske liye:

```bash
docker rm mera-server
```

**Important:** Container ko delete karne se pehle, usse **stop karna zaroori hai** (jab tak tum force use na karo). Agar tum ek running container ko delete karne ki koshish karoge, Docker error dega.

Agar tumhe running container ko force delete karna hai (bina pehle stop kiye):

```bash
docker rm -f mera-server
```

`-f` ka matlab hai "force."

> **Important Point:** `docker stop` aur `docker rm` mein farak yaad rakhna — **stop** matlab "band karo, lekin rakho" (jaise ghar ki bijli off karna). **rm** matlab "permanently hata do" (jaise ghar hi gira dena). Ek baar `rm` kar diya, woh container **hamesha ke liye gaya**, wapas nahi aayega.

---

## Brick 5: docker images aur docker rmi — Images Manage Karna

Jaise containers ke liye `rm` hota hai, Images ke liye bhi delete karne ka apna command hai.

Saari Images dekhna:

```bash
docker images
```

Ek Image delete karna:

```bash
docker rmi nginx
```

`rmi` ka matlab hai "remove image."

> **Important Point:** Agar koi container (chahe stopped hi ho) us Image se bana hua hai, Docker tumhe Image delete nahi karne dega, jab tak pehle woh container delete na ho. Yeh isliye hai kyunki Image ek "naksha" hai — agar us naksha se koi ghar (container) abhi bhi exist karta hai, naksha ko delete karna sahi nahi.

---

## Brick 6: docker logs — Container Ke Andar Kya Ho Raha Hai, Dekhna

Ab socho tumhara container background mein chal raha hai (`-d` ke saath), aur tumhe pata karna hai ki **andar kya ho raha hai** — koi error toh nahi aa raha, sab sahi chal raha hai ya nahi.

```bash
docker logs mera-server
```

Yeh command us container ke **saare output messages** dikhata hai — jaise agar app ne koi error print kiya, ya koi info message diya, sab yahan dikhega.

### Story Time: CCTV Camera Dekhna

Isko socho jaise ek ghar mein CCTV camera laga hai. `docker logs` matlab tum jaake CCTV footage dekh rahe ho — "ghar ke andar kya activity hui, kab kya hua."

Ek useful variation — agar tumhe **real-time** mein logs dekhne hain, jaise woh continuously update ho:

```bash
docker logs -f mera-server
```

`-f` ka matlab hai "follow" — jaise CCTV ki live feed dekhna, na ki purani recording.

---

## Brick 7: docker exec — Container Ke Andar Jaana

Ab yeh sabse interesting command hai. Socho tumhe **container ke andar jaake khud dekhna hai** ki files kaisi hain, kya installed hai — jaise ghar ke andar jaake khud inspect karna, sirf CCTV se nahi.

```bash
docker exec -it mera-server bash
```

Chalo isko todte hain:

- `exec` — matlab "execute," container ke andar ek command chalao
- `-it` — do flags hain milke: `-i` (interactive, matlab tum type kar sakte ho) aur `-t` (terminal jaisa dikhe, readable format mein)
- `mera-server` — kaunse container ke andar jaana hai
- `bash` — konsa command chalana hai andar jaake — yahan hum `bash` chala rahe hain, jo humein container ke andar ek **mini terminal** de dega

Jaise hi yeh command chalega, tumhara terminal prompt change ho jaayega — ab tum **container ke andar** ho! Yahan se tum normal Linux commands use kar sakte ho, jaise:

```bash
ls          # files dekhna
cd /app     # folder change karna
cat file.txt   # file ka content dekhna
```

Bahar nikalne ke liye:

```bash
exit
```

> **Important Point:** `docker exec` bahut useful hai debugging ke liye — jab tumhe pata karna ho ki container ke andar exactly kya ho raha hai, kya files sahi jagah hain, kya environment variables set hain, waghera.

---

## Brick 8: Poora Cheat Sheet — Ek Saath Dekhte Hain

Chalo saare commands ek saath, ek reference table ki tarah dekhte hain:

| Command | Kya Karta Hai |
|---|---|
| `docker run -d --name X -p 8080:80 image` | Naya container banao aur chalao |
| `docker ps` | Chal rahe containers dekho |
| `docker ps -a` | Saare containers dekho |
| `docker stop X` | Container ko rokna (data safe rehta hai) |
| `docker start X` | Rukka hua container wapas chalu karna |
| `docker rm X` | Container ko permanently delete karna |
| `docker images` | Saari images dekhna |
| `docker rmi image` | Image ko delete karna |
| `docker logs X` | Container ke output messages dekhna |
| `docker exec -it X bash` | Container ke andar jaana |

---

## Recap — Jo Aaj Seekha

- `docker run` — `-d` (background), `--name` (naam dena), `-p` (port connect karna) flags ke saath naya container banate hain
- `docker ps` / `docker ps -a` — running / saare containers dekhna
- `docker stop` (rokna, data safe) vs `docker rm` (permanently delete)
- `docker start` — rukke hue container ko wapas chalu karna
- `docker images` / `docker rmi` — images dekhna aur delete karna
- `docker logs` — container ke output messages dekhna, jaise CCTV footage, `-f` se live feed
- `docker exec -it X bash` — container ke andar jaake khud inspect karna

---

## Aage Kya

Agle episode mein hum seekhenge apni **khud ki Image kaise banate hain**, ek **Dockerfile** likh ke — yahan tak hum sirf ready-made images (jaise `nginx`, `hello-world`) use kar rahe the, ab hum apna khud ka app dockerize karna seekhenge.

Agar aaj ka concept clear hua, like zaroor karna, aur agar kahin doubt hai, comment mein pooch lena.

Milte hain agle episode mein. Tab tak keep coding.