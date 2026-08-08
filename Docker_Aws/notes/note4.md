# Episode 4: Images vs Containers

## Introduction

Bhai pichle episode mein humne Docker Architecture samjha — Client, Daemon, Engine. Usme humne baar-baar do words use kiye — **Image** aur **Container**. Aaj hum inhe ekdum clearly samjhenge, kyunki yeh Docker ka **sabse fundamental concept** hai — agar yeh confuse hua, toh aage sab kuch confusing lagega.

Chalo shuru karte hain.

---

## Brick 1: Blueprint Aur Ghar Wali Analogy

### Story Time: Architect Ka Naksha

Socho ek architect ne ek **ghar ka naksha (blueprint)** banaya hai — kaagaz pe drawing, jisme likha hai kitne kamre honge, kahan darwaza hoga, kahan khidki hogi. Yeh naksha khud **rehne layak nahi hai** — tum is kaagaz ke andar reh nahi sakte. Yeh sirf ek **plan** hai.

Ab is naksha ka use karke, builder **actual ghar** bana sakta hai — real ईंटें, real cement, real deewarein. Ab yeh ghar **rehne layak** hai — tum ismein actually reh sakte ho.

**Yahan sabse interesting baat yeh hai** — ek hi naksha (blueprint) se, builder **kayi ghar** bana sakta hai — same design ke, ek colony mein. Har ghar apne aap mein **alag, independent** hai — ek ghar mein aag lage, doosre ghar pe koi asar nahi padega. Lekin sabka original design (naksha) same hai.

**Yehi hai Image aur Container ka rishta.**

---

## Brick 2: Image Kya Hai

**Docker Image** bilkul woh **naksha (blueprint)** hai. Yeh ek **template/plan** hai jisme likha hai:

- Kaunsa Operating System chahiye (jaise Ubuntu Linux)
- Kaunsa software install hona chahiye (jaise Node.js version 18)
- Konsi files project ke andar honi chahiye
- App ko start karne ke liye kaunsa command chalana hai

Image **khud se kuch "chal" nahi rahi hoti** — bilkul jaise naksha khud rehne layak nahi hota. Yeh sirf ek **static plan** hai, disk pe pada hua.

> **Important Point:** Image ek **read-only** template hai — matlab ismein badlaav nahi hota jab tak tum khud se ek nayi image na banao. Yeh hamesha same rehti hai, jaise ek naksha jo baar-baar use ho sakta hai bina khud change hue.

---

## Brick 3: Container Kya Hai

**Docker Container** bilkul woh **actual ghar** hai jo naksha (Image) se banaya gaya hai. Jab tum ek Image ko **"run"** karte ho, Docker us Image se ek **live, running instance** banata hai — yehi Container hai.

Container **actually chal raha hai** — bilkul jaise ghar mein log reh rahe hain, activities ho rahi hain. Container ke andar app actually run kar raha hai, requests handle kar raha hai, kaam kar raha hai.

> **Important Point:** Ek hi Image se, tum **kayi Containers** bana sakte ho — bilkul jaise ek naksha se kayi ghar. Har Container apne aap mein **independent** hota hai. Agar ek Container crash ho jaaye ya delete ho jaaye, doosre Containers pe koi asar nahi padta.

---

## Brick 4: Practically Dekhte Hain

Chalo terminal mein dekhte hain yeh concept.

### Images List Karna

Sabse pehle dekhte hain tumhare paas kaunsi Images already hain:

```bash
docker images
```

Agar tumne pichle episode mein `hello-world` chalaya tha, tumhe kuch aisa dikhega:

```
REPOSITORY    TAG       IMAGE ID       SIZE
hello-world   latest    d2c94e258dcb   13.3kB
```

Yeh dikhata hai tumhare paas ek **"blueprint"** hai jiska naam `hello-world` hai.

### Ek Naya Container Banana Us Image Se

Ab agar tum yeh command chalao:

```bash
docker run hello-world
```

Docker us **image** ko lekar, ek naya **container** banata hai, jo chalta hai, apna message print karta hai, aur khatam ho jaata hai.

### Running Containers Dekhna

Agar tum ek aisi image chalao jo continuously chalti rehti hai (jaise ek web server), aur phir dekho kaunse containers **abhi active hain**:

```bash
docker ps
```

`ps` ka matlab hai "process status" — yeh dikhata hai kaunse containers **abhi chal rahe hain**, jaise dekhna colony mein kaunse ghar mein abhi log active hain.

### Saare Containers Dekhna, Chahe Band Ho Chuke Hon

```bash
docker ps -a
```

`-a` ka matlab hai "all" — yeh un containers ko bhi dikhata hai jo **stop ho chuke hain**, lekin abhi bhi exist karte hain (delete nahi hue).

> **Important Point:** Ek container "stop" hona aur "delete" hona alag cheezein hain. Stopped container abhi bhi disk pe pada hai, tum use dobara start kar sakte ho. Delete karne ke liye alag command chahiye, jo hum agle episodes mein seekhenge.

---

## Brick 5: Ek Image Se Multiple Containers Banana

Chalo practically dekhte hain ki ek hi Image se kayi Containers kaise banate hain. Socho humare paas ek `nginx` naam ki Image hai (yeh ek popular web server software hai).

```bash
docker run -d --name mera-pehla-server nginx
docker run -d --name mera-doosra-server nginx
docker run -d --name mera-teesra-server nginx
```

`-d` ka matlab hai "detached" — matlab container background mein chale, terminal ko block na kare. `--name` se hum container ko ek pehchaan wala naam de rahe hain, taaki confuse na ho.

Ab agar tum `docker ps` chalao, tumhe **teen alag containers** dikhenge — sab **same `nginx` Image se bane hain**, lekin har ek apne aap mein independent hai, apna alag naam hai. Yeh bilkul woh colony jaisi hai jahan ek hi naksha se 3 alag ghar bane hain.

---

## Brick 6: Container Ke Andar Kya Change Hota Hai — Image Pe Asar Nahi Padta

Ek aur important cheez samajhte hain. Socho tum ek container ke andar jaake kuch file create karte ho, ya kuch change karte ho. Kya us Image pe bhi asar padega, jisse woh container bana tha?

**Bilkul nahi.** Yeh bilkul waisa hai jaise tum apne ghar mein ek naya kamra bana lo, ya deewar ka rang badal do — is se woh **original naksha (blueprint)** change nahi hoga. Naksha wahi ka wahi rahega, sirf tumhara **specific ghar** change hua.

> **Important Point:** Agar tum chahte ho ki tumhare changes **permanent** rahein aur ek nayi "reusable blueprint" ban jaaye, tumhe apni changes ko ek **nayi Image mein "commit"** karna padega — yeh ek advanced concept hai jo hum aage dekhenge jab hum apni khud ki Images banana seekhenge, Dockerfile ke through.

---

## Brick 7: Kahan Se Aati Hain Images — Docker Hub Ka Chhota Sa Zikr

Tumne dekha `hello-world` aur `nginx` jaisi Images humne bina khud banaye use ki. Yeh kahan se aayi? Yeh **Docker Hub** se aayi — ek online storage jagah, jaise ek "app store," jahan hazaron ready-made Images pehle se available hain — jaise Node.js, Python, MySQL, sab kuch.

Iske baare mein hum detail mein ek aage ke episode mein seekhenge, lekin abhi ke liye bas itna samajhna hai — jab bhi Docker ko ek Image chahiye jo tumhare computer pe nahi hai, woh automatically Docker Hub se download kar leta hai.

---

## Recap — Jo Aaj Seekha

- **Image** ek "blueprint/naksha" hai — static template jisme likha hai app kaise banega, kya chahiye. Yeh khud "chalta" nahi
- **Container** ek "actual ghar" hai — Image se banaya gaya, actually chal raha, live instance
- Ek Image se **kayi independent Containers** bana sakte hain
- `docker images` — saari Images dekhna
- `docker run` — Image se ek naya Container banana aur chalana
- `docker ps` — abhi chal rahe Containers dekhna, `docker ps -a` — saare Containers (running + stopped)
- Container ke andar ke changes, original Image ko affect nahi karte

---

## Aage Kya

Agle episode mein hum in commands ko aur zyada practice karenge, aur seekhenge kaise Containers ko **stop, start, aur completely remove** karte hain — poora lifecycle management.

Agar aaj ka concept clear hua, like zaroor karna, aur agar kahin doubt hai, comment mein pooch lena.

Milte hain agle episode mein. Tab tak keep coding.