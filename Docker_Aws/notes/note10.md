# Episode 10: Practical Project — MERN Stack Ko Dockerize Karna

## Introduction

Bhai ab tak humne saare zaroori concepts seekh liye — Images, Containers, Dockerfile, Volumes, Networking, Compose. Aaj hum sab kuch **ek saath, ek real project** mein apply karenge. Hum ek poora **MERN Stack app** (MongoDB + Express + React + Node) dockerize karenge.

Yeh episode course ka **capstone** hai — sab kuch jo humne seekha, yahan use hoga. Chalo shuru karte hain.

---

## Brick 1: Project Structure Samajhते Hain

Maan lo humara project kuch aise structured hai:

```
mera-mern-app/
├── backend/
│   ├── package.json
│   ├── index.js
│   └── ...
├── frontend/
│   ├── package.json
│   ├── src/
│   └── ...
└── docker-compose.yml
```

Humein **teen cheezein** chahiye:
1. Backend (Node/Express) ke liye ek Dockerfile
2. Frontend (React) ke liye ek Dockerfile
3. Ek `docker-compose.yml` jo backend, frontend, aur MongoDB — teenon ko jode

---

## Brick 2: Backend Ka Dockerfile

`backend/Dockerfile`:

```dockerfile
FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5000

CMD ["node", "index.js"]
```

Yeh humne pichle episodes mein already seekha hai — kuch naya nahi. Bas port `5000` diya hai, jo humara backend use karega (yeh tumhare actual code ke hisaab se badal sakta hai).

---

## Brick 3: Frontend Ka Dockerfile — Yahan Ek Naya Concept Hai

Frontend (React) thoda alag hai. React app **development** mein alag tareeke se chalta hai, aur **production** mein alag. Chalo pehle simple development wala dekhते hain:

```dockerfile
FROM node:18

WORKDIR /app

COPY package.json .

RUN npm install

COPY . .

EXPOSE 5173

CMD ["npm", "run", "dev"]
```

Yeh development ke liye theek hai. Lekin production ke liye, ek better approach hai — **Multi-Stage Build**. Chalo isko samajhте hain, thoda advanced concept.

### Story Time: Kitchen Mein Cooking Vs Serving

Socho ek restaurant mein khaana banane ke liye **bahut saara saaman** chahiye — cutting boards, raw ingredients, multiple pots, masale. Lekin jab khaana **table pe serve** hota hai, sirf ek **plate mein final dish** chahiye — customer ko kitchen ka mess dikhane ki zaroorat nahi.

**Multi-Stage Build isi tarah kaam karta hai** — pehle ek "kitchen stage" mein hum poora build process karते hain (jisme bahut saari temporary files, dependencies lagte hain), aur phir sirf **final, ready output** ko ek chhote, clean Image mein le jaate hain.

```dockerfile
# Stage 1: Build karna (Kitchen)
FROM node:18 AS build

WORKDIR /app

COPY package.json .
RUN npm install

COPY . .
RUN npm run build

# Stage 2: Sirf final output serve karna (Serving Plate)
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

Chalo isko samajhте hain:

- **Stage 1** (`AS build`) — yahan hum poora React project build karte hain, jisme Node.js, npm packages, sab kuch chahiye. Yeh stage **bahut bhaari** hai.
- **Stage 2** — yeh ek bilkul naya, halka `nginx` image se shuru hota hai. `COPY --from=build /app/dist ...` sirf **build ka final output** (jo `dist` folder mein hota hai) is naye, halke image mein le aata hai.

> **Important Point:** Final Image mein Node.js, npm, ya humara source code kuch bhi nahi hai — **sirf final HTML/CSS/JS files** hain, jo `nginx` serve karta hai. Isse Image ka **size bahut chhota** ho jaata hai, aur production mein yeh **fast aur secure** hota hai (kyunki extra, unnecessary tools nahi hain jo security risk ban sakte hain).

---

## Brick 4: docker-compose.yml — Sabko Jodते Hain

Ab poora project root mein, `docker-compose.yml`:

```yaml
version: "3.8"

services:
  mongodb:
    image: mongo
    volumes:
      - mongo-data:/data/db
    networks:
      - mern-network

  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      MONGO_URI: mongodb://mongodb:27017/mera-app
    depends_on:
      - mongodb
    networks:
      - mern-network

  frontend:
    build: ./frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - mern-network

networks:
  mern-network:

volumes:
  mongo-data:
```

Chalo dekhte hain kya naya hai yahan:

- `build: ./backend` — yeh batata hai "backend folder ke andar jo Dockerfile hai, usse use karo" (na ki current folder ka)
- `MONGO_URI: mongodb://mongodb:27017/mera-app` — yahan dekho, humne **`mongodb`** likha hai (jo Compose file mein humare MongoDB service ka naam hai), na ki koi IP address. Yaad hai Networking wale episode se — same network mein containers naam se baat kar sakte hain!
- `depends_on: - mongodb` — backend, mongodb start hone ke baad start hoga
- `depends_on: - backend` — frontend, backend start hone ke baad start hoga

---

## Brick 5: Backend Code Mein MongoDB Se Connect Karna

Sirf reference ke liye, backend ke `index.js` mein connection kuch aisा dikhega:

```javascript
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected!"))
  .catch((err) => console.log(err));
```

Dekho — `process.env.MONGO_URI` — yeh humare Compose file mein diya gaya `environment` variable use kar raha hai. Isse humein connection string ko code mein **hardcode nahi karna padta** — Docker Compose se automatically aa jaata hai.

---

## Brick 6: Poora Project Chalana

Ab sabse acchi baat — poora project, **sirf ek command** se:

```bash
docker-compose up -d
```

Yeh command:
1. MongoDB Image download karega (agar nahi hai)
2. Backend ki Image build karega (uske Dockerfile se)
3. Frontend ki Image build karegi (multi-stage build ke saath)
4. Teenon ko `mern-network` mein connect karega
5. Sabko sahi order mein start karega

Kuch minute wait karo (pehli baar build hone mein time lagega), phir browser mein `localhost` (frontend ke liye) ya `localhost:5000` (backend API ke liye) khol ke check kar sakte ho.

### Sab Kuch Sahi Chal Raha Hai, Verify Karте Hain

```bash
docker-compose ps
```

Yeh dikhayega teeno services chal rahi hain ya nahi.

```bash
docker-compose logs backend
```

Agar koi error hai, backend ke logs check karke pata chal jaayega.

---

## Brick 7: Ek Zaroori File — .dockerignore

Ek aakhri, lekin bahut zaroori cheez. Yaad hai humne `COPY . .` use kiya, jo poora folder container mein copy karta hai? Isme galti se `node_modules` folder bhi copy ho sakta hai (agar tumne locally already `npm install` kiya hai), jo bahut **bada aur bekaar** hai container ke andar (kyunki container apne andar khud `npm install` karega).

Iske liye, project ke root mein ek `.dockerignore` file banate hain:

```
node_modules
.git
.env
*.log
```

Yeh Docker ko batata hai — "yeh files/folders build ke time **ignore** kar do, container mein copy mat karo." Yaad hai `.gitignore` humne Git series mein seekha tha? Yeh bilkul wahi concept hai, bas Docker ke liye.

> **Important Point:** `.dockerignore` hamesha banao apne projects mein — yeh Image ka size chhota rakhta hai, build ko fast karta hai, aur sensitive files (jaise `.env` mein API keys) ko galti se Image ke andar jaane se rokta hai.

---

## Recap — Jo Aaj Seekha

- Poora MERN app dockerize karne ke liye — backend ka Dockerfile, frontend ka Dockerfile, aur inhe jodने wala `docker-compose.yml`
- **Multi-Stage Build** — pehle stage mein build karo (heavy), doosre stage mein sirf final output ko halke image mein le jaao — jaise kitchen vs serving plate
- Compose file mein containers **naam se** ek doosre se connect hote hain (jaise `mongodb://mongodb:27017/...`)
- `docker-compose up -d` — poora multi-service app ek command se chalu karna
- `.dockerignore` — zaroori nahi, unnecessary files ko container mein jaane se rokna

---

Agar aaj ka concept clear hua, like zaroor karna, aur agar kahin doubt hai, comment mein pooch lena.

Milte hain agle episode mein. Tab tak keep coding.