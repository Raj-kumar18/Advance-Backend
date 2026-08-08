# Episode 6: Dockerfile — Apni Custom Image Banana

## Introduction

Bhai ab tak humne sirf **ready-made Images** use ki hain — `nginx`, `hello-world`. Lekin real mein, tumhe apna **khud ka app** dockerize karna hoga — jaise tumhara Node.js backend, ya React app. Iske liye chahiye **Dockerfile**.

Yeh episode course ka **sabse important** hissa hai — is episode ke baad, tum kisi bhi apne project ko Docker mein daal sakte ho. Chalo shuru karte hain, brick by brick.

---

## Brick 1: Dockerfile Kya Hai

### Story Time: Recipe Card Wali Kahani

Yaad hai humne "naksha/blueprint" wali baat ki thi Image ke liye? Ab sawaal yeh hai — **woh naksha khud kaise banta hai?**

Socho ek chef ek naya dish invent karta hai. Woh ek **recipe card** likhta hai — step by step instructions: "pehle pyaaz kaato, phir tel garam karo, phir masale daalo..." Yeh recipe card khud khaana nahi hai, lekin agar koi bhi is recipe ko follow kare, **wahi dish ban jaayega, har baar same tareeke se.**

**Dockerfile bilkul yeh recipe card hai.** Yeh ek simple text file hai, jisme step-by-step instructions likhi hoti hain ki **Image kaise banani hai**. Jab Docker is Dockerfile ko "follow" karta hai (jise hum "build" karna bolte hain), yeh ek **Image** bana deta hai.

```
Dockerfile (recipe) → docker build (banana) → Image (final dish/blueprint) → docker run → Container (khaya ja raha dish)
```

---

## Brick 2: Dockerfile Ke Zaroori Instructions

Chalo ek-ek karke Dockerfile ke main commands samajhte hain, jaise recipe ke steps.

### FROM — Kis Base Se Shuru Karna Hai

```dockerfile
FROM node:18
```

Har recipe kisi na kisi **base ingredient** se shuru hoti hai — jaise atta. `FROM` batata hai — "hum kis existing Image ko **base** bana ke apna kaam shuru kar rahe hain."

Yahan `node:18` matlab — "mujhe ek aisi Image chahiye jisme pehle se Node.js version 18 installed ho." Isse humein khud se Node.js install karne ki zaroorat nahi padti — yeh already available image istemal kar rahe hain, jo Docker Hub se aati hai.

> **Important Point:** `FROM` **hamesha Dockerfile ki pehli line** honi chahiye. Yeh foundation hai — jaise ghar banane se pehle zameen chahiye.

### WORKDIR — Kaam Karne Ka Folder Set Karna

```dockerfile
WORKDIR /app
```

Isko socho jaise chef bolta hai "main is table pe kaam karunga." `WORKDIR` batata hai container ke **andar**, kaunse folder mein hum aage ka kaam karenge. Agar yeh folder exist nahi karta, Docker khud bana deta hai.

### COPY — Files Ko Andar Le Jaana

```dockerfile
COPY package.json .
```

Yeh command tumhare computer ki file ko, **container ke andar** copy karta hai. Yahan humne `package.json` file ko copy kiya, current WORKDIR (`/app`) mein (isliye `.` diya, jo matlab hai "yahan hi").

### RUN — Ek Command Chalana, Build Ke Time

```dockerfile
RUN npm install
```

`RUN` woh commands hain jo **Image banate waqt** chalte hain — jaise chef recipe follow karte waqt "pyaaz kaato" wala step karta hai. Yahan humne `npm install` chalaya, jo `package.json` mein diye gaye saare dependencies install karega.

### COPY (Dobara) — Baaki Saara Code Le Jaana

```dockerfile
COPY . .
```

Ab hum apne **poore project ka baaki code** bhi container ke andar copy kar dete hain.

> **Important Point:** Dhyan do humne `package.json` ko pehle alag se copy kiya, phir `npm install` chalaya, **uske baad** baaki code copy kiya. Yeh ek smart trick hai — hum ise thodi der mein detail se samjhenge, "layer caching" ke naam se.

### EXPOSE — Batana Kaunsa Port Use Hoga

```dockerfile
EXPOSE 3000
```

Yaad hai humne `-p` flag dekha tha port connect karne ke liye? `EXPOSE` sirf ek **documentation** hai — yeh batata hai "yeh app andar port 3000 pe chalta hai." Yeh khud se port ko bahar connect nahi karta (woh `docker run -p` karta hai), lekin yeh ek useful hint hai jo dusre developers ko pata chale.

### CMD — Container Start Hone Pe Kya Chalega

```dockerfile
CMD ["node", "index.js"]
```

`CMD` batata hai — jab **Container start ho** (matlab `docker run` chale), tab kaunsa command chalana hai. Yahan hum bata rahe hain "node index.js chalao" — matlab humara app start ho jaaye.

> **Important Point:** `RUN` aur `CMD` mein farak yaad rakhna zaroori hai. **`RUN` Image banate waqt (build time) chalta hai**, jaise dependencies install karna. **`CMD` Container start hote waqt (run time) chalta hai**, jaise actual app ko start karna. `RUN` sirf ek baar chalta hai jab Image ban rahi hai, `CMD` har baar chalta hai jab bhi tum container run karte ho.

---

## Brick 3: Poora Dockerfile — Ek Saath Dekhते Hain

Chalo ek simple Node.js Express app ke liye poora Dockerfile dekhते hain:

```dockerfile
FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 3000

CMD ["node", "index.js"]
```

Yeh file, project ke **root folder** mein, `Dockerfile` naam se save karni hai (bina kisi extension ke — na `.txt`, na kuch aur, sirf `Dockerfile`).

---

## Brick 4: Image Ko Build Karna

Ab humne recipe likh li, ab actual "dish" banate hain — matlab Image build karte hain.

Terminal mein, us folder ke andar jahan `Dockerfile` hai:

```bash
docker build -t mera-app .
```

Chalo isko todte hain:

- `docker build` — Dockerfile ko follow karke Image banao
- `-t mera-app` — Image ko ek naam do (`-t` matlab "tag"), taaki baad mein pehchan sako
- `.` — yeh batata hai "Dockerfile is current folder mein hai, aur baaki files bhi yahin se lo"

Yeh command chalते hi, tumhe terminal mein **har step ka output** dikhega — jaise `FROM node:18` download ho raha hai, phir `npm install` chal raha hai, waghera. Poora hone ke baad:

```
Successfully built a1b2c3d4e5
Successfully tagged mera-app:latest
```

Ab agar tum `docker images` chalao, tumhe apni nayi `mera-app` Image dikhegi!

---

## Brick 5: Apni Custom Image Ko Run Karna

Ab bilkul waise hi jaise humne `nginx` chalaya tha:

```bash
docker run -d --name mera-app-container -p 3000:3000 mera-app
```

Browser mein `localhost:3000` khologe, aur tumhara **apna app** chal raha dikhega — Docker container ke andar se!

---

## Brick 6: Layer Caching — Ek Smart Optimization

Yaad hai humne pehle bola tha, `package.json` pehle copy karna aur `npm install` alag se, ek "smart trick" hai? Chalo isko samajhte hain.

### Story Time: Recipe Ke Steps Dobara Na Karna

Socho tumne ek recipe follow ki, aur sirf **aakhri step mein** ek chhota sa change kiya (jaise namak thoda kam kiya). Kya tumhe **poori recipe phir se** shuru se karni padegi — pyaaz phir se kaatna, tel phir se garam karna? Nahi! Tum sirf **last step** repeat karoge, baaki sab already ready hai.

**Docker bhi aisa hi karta hai** — har `RUN`, `COPY` step ko ek **"layer"** ki tarah treat karta hai, aur **cache** kar leta hai. Agar tumne dobara `docker build` chalaya, aur sirf tumhare app ka code change hua hai (`package.json` nahi), toh Docker `npm install` wala step **dobara nahi chalayega** — kyunki woh already cache mein hai, same result aayega. Yeh sirf woh steps chalayega jo change hue hain.

Isliye humne **pehle `package.json` copy kiya, `npm install` chalaya, phir baaki code copy kiya** — taaki jab bhi sirf code change ho (jo bahut zyada baar hota hai), `npm install` (jo time leta hai) **dobara na chalna pade**. Yeh build ko **bahut fast** bana deta hai.

> **Important Point:** Yeh ordering trick bahut common hai real projects mein. Jo cheezein **kam badalti hain** (jaise dependencies list), unhe **pehle** rakho. Jo cheezein **zyada badalti hain** (jaise tumhara actual code), unhe **baad mein** rakho.

---

## Recap — Jo Aaj Seekha

- **Dockerfile** ek "recipe card" hai — step-by-step instructions jinse Image banti hai
- `FROM` — kis base Image se shuru karna hai
- `WORKDIR` — container ke andar kaam karne ka folder
- `COPY` — files ko computer se container ke andar le jaana
- `RUN` — build time pe command chalana (jaise dependencies install karna)
- `EXPOSE` — documentation ke liye batana kaunsa port use hoga
- `CMD` — container start hote waqt kaunsa command chalega
- `docker build -t naam .` — Dockerfile follow karke Image banana
- **Layer caching** — kam-badalne wali cheezein pehle rakhna, taaki build fast ho

---

## Aage Kya

Agle episode mein hum seekhenge **Docker Hub** — kaise apni bani hui Image ko online upload (push) karte hain, aur doosron ki Images kaise download (pull) karte hain.

Agar aaj ka concept clear hua, like zaroor karna, aur agar kahin doubt hai, comment mein pooch lena. Yeh episode thoda heavy tha, dobara padh lena agar zaroorat lage.

Milte hain agle episode mein. Tab tak keep coding.