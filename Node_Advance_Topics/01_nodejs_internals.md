<div align="center">

# 🟢 Node.js Runtime — Complete Internals Guide
### *V8, libuv, Event Loop, Memory Model aur Architecture — Hinglish me*

</div>

---

## 📑 Table of Contents

**Chapter 1 — Introduction to Node.js Runtime**
1. [What is Runtime?](#1-what-is-runtime)
2. [Real Life Example](#2-real-life-example)
3. [Browser Runtime](#3-browser-runtime)
4. [What is Node.js?](#4-what-is-nodejs)
5. [Why was Node.js Created?](#5-why-was-nodejs-created)
6. [Browser vs Node.js](#6-browser-vs-nodejs)
7. [What is V8 Engine?](#7-what-is-v8-engine)
8. [JavaScript Engine vs Runtime](#8-javascript-engine-vs-runtime)
9. [Node.js Core APIs](#9-nodejs-core-apis)
10. [Why is Node.js Fast?](#10-why-is-nodejs-fast)
11. [Node.js High-Level Architecture](#11-nodejs-high-level-architecture)
12. [Common Misconceptions](#12-common-misconceptions)

**Chapter 2 — Node.js Runtime Internals**
13. [C++ Bindings](#13-c-bindings)
14. [libuv](#14-libuv)
15. [Event Loop](#15-event-loop)
16. [Blocking vs Non-Blocking I/O](#16-blocking-vs-non-blocking-io)
17. [Single Thread vs Multi Thread](#17-single-thread-vs-multi-thread)
18. [Thread Pool](#18-thread-pool)
19. [Call Stack](#19-call-stack)
20. [Heap Memory](#20-heap-memory)
21. [Garbage Collection](#21-garbage-collection)
22. [Complete File Read Flow](#22-complete-file-read-flow)

23. [Deep Dive: Memory in JavaScript (Extended Notes)](#23-deep-dive-memory-in-javascript-extended-notes)

**Reference**
24. [Interview Questions](#24-interview-questions)
25. [Key Takeaways](#25-key-takeaways)

---
---

# 📘 CHAPTER 1 — Introduction to Node.js Runtime

---

## 1. What is Runtime?

Sabse pehle ek question:

```js
console.log("Hello World");
```

> **Ye code kaun chalata hai?**

JavaScript khud se execute nahi hoti — usko execute karne ke liye ek **environment** chahiye. Us environment ko **Runtime** kehte hain.

> ### 💡 Definition
> **Runtime** ek software environment hota hai jo tumhare code ko execute karta hai aur Operating System ke saath communicate karne ke liye APIs provide karta hai.

```text
JavaScript Code
      ↓
   Runtime
      ↓
Operating System
      ↓
     CPU
```

Runtime sirf code execute nahi karta — ye bahut saari extra facilities bhi provide karta hai:

- ⏱️ Timers
- 🌐 Networking
- 📁 File System
- 🧠 Memory Management
- ⚙️ Process Management

---

## 2. Real Life Example

Suppose tum car chalana chahte ho:

```text
Car → Engine → Fuel → Road → Driver
```

Tab jaake car chalti hai. Waise hi:

```text
JavaScript → Runtime → Operating System → CPU
```

Tab program execute hota hai.

---

## 3. Browser Runtime

Agar tum browser me JavaScript likhte ho:

```html
<script>
  console.log("Hello");
</script>
```

To browser ke andar runtime already hota hai. **Browser Runtime** provide karta hai:

| API | Purpose |
|---|---|
| `document` | DOM access |
| `window` | Global browser object |
| `history` | Navigation history |
| `localStorage` | Persistent client storage |
| `sessionStorage` | Session-based storage |
| `fetch` | Network requests |
| `navigator` | Browser/device info |

```js
document.querySelector("h1")   // ✅ Browser me chalega
                                // ❌ Node.js me nahi
```

**Browser Architecture:**

```text
JavaScript
    ↓
Browser Runtime
    ↓
DOM · Window · Storage
    ↓
Operating System
```

---

## 4. What is Node.js?

**Node.js ek JavaScript Runtime hai** jo browser ke bahar JavaScript ko execute karta hai.

```js
console.log("Node.js");   // Terminal me chalega
```

> ⚠️ Node.js browser **nahi** hai. Node.js **server-side JavaScript runtime** hai.

---

## 5. Why was Node.js Created?

2009 se pehle, JavaScript sirf browser ke andar chalti thi. Server-side languages thi:

- Java
- PHP
- Python
- Ruby

Ryan Dahl ne socha — *"JavaScript itni fast hai, to browser ke bahar kyun nahi chal sakti?"*

Usne Google ke **V8 Engine** ko use kiya aur uske upar APIs bana di.

```text
V8 Engine + Custom APIs  =  🟢 Node.js
```

---

## 6. Browser vs Node.js

<table>
<tr><th>Browser</th><th>Node.js</th></tr>
<tr><td>

```
document
window
history
navigator
localStorage
sessionStorage
```

</td><td>

```
fs
http
path
crypto
stream
buffer
process
events
```

</td></tr>
</table>

```js
document.body        // ✅ Valid in Browser
import fs from "node:fs";   // ✅ Valid in Node.js — ❌ Error in Browser
```

### 📊 Feature Comparison

| Browser | Node.js |
|----------|----------|
| DOM | File System |
| Window | HTTP Server |
| LocalStorage | Streams |
| History | Crypto |
| Navigator | Process |

---

## 7. What is V8 Engine?

**V8** Google ka JavaScript Engine hai — Chrome bhi isi ko use karta hai, Node.js bhi isi ko use karta hai.

**Responsibilities:**
- Parse JavaScript
- Compile JavaScript
- Execute JavaScript
- Memory Management
- Garbage Collection

```text
JavaScript
    ↓
  Parser
    ↓
   AST
    ↓
Machine Code
    ↓
   CPU
```

### ✅ V8 Can Do

```js
const a = 10;
const b = 20;
console.log(a + b);   // Perfect ✅
```

### ❌ V8 Cannot Do

```js
fs.readFile()   // Error ❌ — V8 file system nahi janta
```

Node.js V8 ke upar APIs provide karta hai:

```js
import fs from "node:fs";
fs.readFile(...)
```

> Ye JavaScript ka feature nahi hai — ye **Node.js** ka feature hai.

---

## 8. JavaScript Engine vs Runtime

> 🎯 **Bahut important interview question.**

| JavaScript Engine | Runtime |
|---|---|
| Sirf JavaScript execute karta hai | JavaScript execute bhi karta hai |
| — | Extra APIs bhi provide karta hai |

```text
Runtime
  │
  ├── Engine
  ├── APIs
  ├── Memory
  ├── Networking
  ├── Timers
  └── Process
```

---

## 9. Node.js Core APIs

Node.js bahut saare built-in modules provide karta hai:

```
fs · http · https · path · os
crypto · events · stream · buffer
process · timers
```

> Ye APIs browser me available **nahi** hoti.

---

## 10. Why is Node.js Fast?

### ① V8 Engine
Machine code generate karta hai.

### ② Event Loop
Ek thread me bahut requests handle karta hai.

### ③ Non-Blocking I/O
Program wait nahi karta.

### ④ Async Architecture
Background me kaam chalta rehta hai.

**🔴 Blocking Example**

```js
const data = fs.readFileSync("big.txt");
console.log(data);
```

```text
Read File  ████████████████████ 
Console
```
Program **ruk gaya**.

**🟢 Non-Blocking Example**

```js
fs.readFile("big.txt", () => {
  console.log("Done");
});
```

```text
Read File → Background → Program Continues → Callback
```

---

## 11. Node.js High-Level Architecture

```text
                   Your JavaScript
        (Express, HTTP, FS, Timers...)
                       │
                       ▼
                 Node.js Runtime
                       │
        ┌──────────────┴──────────────┐
        │                             │
        ▼                             ▼
    V8 Engine                   Node Core APIs
 (Execute JavaScript)      (fs, http, crypto...)
                                      │
                                      ▼
                                C++ Bindings
                                      │
                                      ▼
                                   libuv
                                      │
                      ┌───────────────┴──────────────┐
                      ▼                              ▼
               Event Loop                    Thread Pool
                      │                              │
                      └───────────────┬──────────────┘
                                      ▼
                               Operating System
                                      ▼
                                Disk / Network
```

### First Program — Internal Flow

```js
console.log("Hello");
```

```text
JavaScript → V8 Parser → Compile → Machine Code → CPU → Console Output
```

```js
import fs from "node:fs";
fs.readFile("demo.txt", () => {
  console.log("Done");
});
```

```text
JavaScript → Node.js fs Module → C++ Binding → libuv
   → Operating System → Disk → Read Data
   → Callback Queue → Event Loop → Call Stack → Console
```

---

## 12. Common Misconceptions

| ❌ Misconception | ✅ Reality |
|---|---|
| JavaScript can read files | Node.js reads files |
| V8 creates HTTP Server | Node.js HTTP Module creates HTTP Server |
| Node.js is a programming language | JavaScript is the language; Node.js is the runtime |

---
---

# 📗 CHAPTER 2 — Node.js Runtime Internals

> **Goal:** Understand how Node.js works internally.

---

## 13. C++ Bindings

JavaScript directly Operating System se communicate **nahi** kar sakti — OS sirf native code samajhta hai. Node.js is problem ko **C++ Bindings** se solve karta hai — ek translator ki tarah.

```text
JavaScript
    ↓
fs.readFile()
    ↓
C++ Binding
    ↓
  libuv
    ↓
Operating System
```

**Real Life Analogy:**

```text
Hindi → Translator → English → American
JavaScript → C++ → Operating System
```

---

## 14. libuv

**libuv** ek C library hai jo Node.js internally use karta hai — ye asynchronous work manage karta hai.

**Responsibilities:**
- Event Loop
- Thread Pool
- Timers
- File System
- DNS
- Networking

```js
fs.readFile("demo.txt", callback);
```

```text
JavaScript → Node API → C++ Binding → libuv
    → Operating System → Read File
    → Callback Queue → Event Loop → Call Stack
```

---

## 15. Event Loop

JavaScript **single-threaded** hai — to ye kaam kaise karta hai?

```js
console.log("A");

setTimeout(() => {
  console.log("B");
}, 1000);

console.log("C");
```

**Output:**
```
A
C
B
```

> `setTimeout` JavaScript ko **block nahi** karta.

```text
Call Stack → setTimeout() → libuv Timer → 1 Second Complete
    → Callback Queue → Event Loop → Call Stack → Execute Callback
```

### 🔁 Job of Event Loop

```text
Is Call Stack Empty?
        ↓ Yes
Any callback waiting?
        ↓ Yes
Move callback to Call Stack
        ↓
     Execute
```

---

## 16. Blocking vs Non-Blocking I/O

**What is I/O?** — Input/Output operations jaise: Reading File, Writing File, Database, HTTP Request, Network.

### 🔴 Blocking I/O

```js
const data = fs.readFileSync("movie.mp4");
console.log(data);
```

```text
Read File  ██████████████
Console
```
Program **wait** karta hai jab tak file completely read na ho jaaye — kuch aur execute nahi hota.

### 🟢 Non-Blocking I/O

```js
fs.readFile("movie.mp4", () => {
  console.log("Done");
});

console.log("Continue...");
```

**Output:**
```
Continue...
Done
```

```text
Start Reading → Background → Program Continues → Read Complete → Callback
```

---

## 17. Single Thread vs Multi Thread

> **Thread** = CPU dwara execute ki jaane wali instructions ki sequence.

### Single Thread
Node.js JavaScript ko sirf **one main thread** par execute karta hai — sirf ek Call Stack exist karta hai.

```text
Main Thread → JS → JS → JS
```

### Multi Thread
Kai languages code ko multiple threads par execute karti hain — har thread independently kaam kar sakta hai.

```text
Thread 1   Thread 2   Thread 3   Thread 4
```

### 🤔 Is Node.js Single Threaded?

Most people kehte hain: *"Node.js is Single Threaded"* — ye sirf **partially correct** hai.

> **Correct statement:** JavaScript **execution** single-threaded hai. Node.js internally **libuv** ke through multiple threads use karta hai.

---

## 18. Thread Pool

Heavy operations **libuv Thread Pool** me run hote hain.

**Default size:** `4 Threads`

```text
             Main JS Thread
                   │
        ┌──────────┼──────────┐
        │          │          │
    Thread 1   Thread 2   Thread 3   Thread 4
```

Thread Pool handles:
- File System
- Crypto
- DNS
- Compression

> ℹ️ HTTP sockets generally OS ki asynchronous networking use karte hain, thread pool ki nahi.

---

## 19. Call Stack

> 🎯 Ek sabse important concept.

**Call Stack** currently executing functions ki information store karta hai — books ke stack ki tarah. Last book placed on top **sabse pehle** remove hoti hai — isko kehte hain:

> ### 📚 LIFO — Last In First Out

```js
function one() { two(); }
function two() { three(); }
function three() { console.log("Hello"); }

one();
```

### Step-by-step Execution

| Step | Action | Call Stack (top → bottom) |
|---|---|---|
| 1 | Program start | `Global` |
| 2 | `one()` called | `one()` → `Global` |
| 3 | `two()` called | `two()` → `one()` → `Global` |
| 4 | `three()` called | `three()` → `two()` → `one()` → `Global` |
| 5 | `console.log()` runs & pops | Stack unwinds completely |

```text
┌────────────┐
│console.log │
├────────────┤
│three()     │
├────────────┤
│two()       │
├────────────┤
│one()       │
└────────────┘
```

**Rule:** Function call → **Push** | Function complete → **Pop**

### ⚠️ Stack Overflow

```js
function hello() {
  hello();   // khud ko baar-baar call kar raha hai
}
hello();
```

Stack kabhi khali hi nahi hoga:

```text
hello() → hello() → hello() → hello() → ...
```

**Result:**
```
RangeError: Maximum call stack size exceeded
```

---

## 20. Heap Memory

Objects Stack me store **nahi** hote — ye **Heap Memory** me store hote hain (ek large memory area).

```js
const user = {
  name: "Raj",
  age: 20
};
```

```text
Stack                    Heap
─────                    ────
user ──── Reference ────▶ ┌─────────────┐
                           │ name : Raj  │
                           │ age  : 20   │
                           └─────────────┘
```

### Reference Sharing

```js
const user1 = { name: "Raj" };
const user2 = user1;

user2.name = "Aman";
console.log(user1.name);   // "Aman"
```

```text
Stack                    Heap
─────                    ────
user1 ──┐
user2 ──┴──── Reference ────▶ ┌─────────────┐
                               │ name : Raj  │
                               └─────────────┘
```

> Dono variables **same object** ko point kar rahe hain — isliye change dono jagah reflect hota hai.

### 🔢 Primitive vs Object

**Primitive (copy by value):**
```js
let a = 10;
let b = a;
b = 50;
// a = 10, b = 50 → alag-alag copies
```

**Object (copy by reference):**
```js
const a = { x: 10 };
const b = a;
b.x = 100;
// a.x = 100 → reference copy hua
```

### 📊 Stack vs Heap

| Stack | Heap |
|---|---|
| Stores function calls | Stores objects |
| Small memory | Large memory |
| Fast | Slower than stack |
| Automatically cleared | Garbage Collector cleans it |
| LIFO | Dynamic Allocation |

---

## 21. Garbage Collection

Heap Memory keeps growing jab bhi objects create hote hain.

```js
let user = { name: "Raj" };
user = null;
```

Ab koi variable is object ko point nahi kar raha — object **unreachable** ban jaata hai. V8 ka **Garbage Collector** eventually isko remove karke memory free kar deta hai.

### 🏨 Real Life Analogy — Hostel

```
Heap  = Hostel ke rooms
Stack = Reception register
```

- Student room leta hai → Register me room number likha jaata hai (**Stack → Reference**), student room me rehta hai (**Heap → Object**)
- Student hostel chhod deta hai, register se naam hata diya jaata hai → Room khaali → **Cleaner (Garbage Collector)** aakar room clean karke free kar deta hai

### Reachable vs Unreachable

| State | Stack | Heap | GC Action |
|---|---|---|---|
| Reachable | `user →` | Object exists | Don't delete |
| Unreachable | `user = null` | Object orphaned | Delete |

### 🗺️ Complete Memory Diagram

```text
             JavaScript Memory

        ┌─────────────────────────┐
        │       Call Stack        │
        │─────────────────────────│
        │ Global Context          │
        │ one()                   │
        │ two()                   │
        │ Local Variables         │
        └────────────┬────────────┘
                     │ References
                     ▼
        ┌─────────────────────────┐
        │       Heap Memory       │
        │─────────────────────────│
        │ User Object             │
        │ Product Object          │
        │ Arrays                  │
        │ Functions               │
        └─────────────────────────┘
                     │
                     ▼
        Garbage Collector cleans
          unreachable objects
```

### 🧠 One-Liner to Remember

| Concept | Question it answers |
|---|---|
| **Call Stack** | "What function is running right now?" |
| **Heap Memory** | "Where are my objects stored?" |
| **Garbage Collector** | "Which objects are no longer used, so memory can be freed?" |

> Ye teen concepts samajh gaye to Event Loop, async code, closures, memory leaks, aur Node.js internals samajhna bahut aasaan ho jaata hai. 🚀

---

## 22. Complete File Read Flow

```js
fs.readFile("movie.mp4", callback);
```

```text
JavaScript
    ↓
Node fs Module
    ↓
C++ Binding
    ↓
   libuv
    ↓
Thread Pool
    ↓
Operating System
    ↓
    Disk
    ↓
Read Complete
    ↓
Event Loop
    ↓
Call Stack
    ↓
 callback()
    ↓
  Console
```

---
---

## 23. Deep Dive: Memory in JavaScript (Extended Notes)

Jab tum program run karte ho, V8 Engine memory ko mainly **2 parts** me divide karta hai.

```text
                Memory
                  │
      ┌───────────┴───────────┐
      │                       │
      ▼                       ▼
 Call Stack              Heap Memory
```

- **Call Stack** → Function execution ko manage karta hai.
- **Heap Memory** → Objects aur Arrays ko store karta hai.

### What is Call Stack?

Call Stack ek **LIFO (Last In First Out)** data structure hai. Ye store karta hai:

- Function Calls
- Local Variables
- Function Parameters
- Return Address

Socho tumhare paas books ka stack hai:

```text
┌──────────┐
│ Book 3   │
├──────────┤
│ Book 2   │
├──────────┤
│ Book 1   │
└──────────┘
```

Jo book sabse last me rakhi gayi, wo sabse pehle niklegi. Isi ko bolte hain **Last In First Out (LIFO)**. Call Stack bhi exactly aisa hi kaam karta hai.

**Example**

```js
function one() {
    two();
}

function two() {
    three();
}

function three() {
    console.log("Hello");
}

one();
```

**Step 1** — Program start hua.

```text
┌──────────┐
│ Global   │
└──────────┘
```

**Step 2** — `one()` call hua.

```text
┌──────────┐
│ one()    │
├──────────┤
│ Global   │
└──────────┘
```

**Step 3** — `two()` call hua.

```text
┌──────────┐
│ two()    │
├──────────┤
│ one()    │
├──────────┤
│ Global   │
└──────────┘
```

**Step 4** — `three()` call hua.

```text
┌──────────────┐
│ three()      │
├──────────────┤
│ two()        │
├──────────────┤
│ one()        │
├──────────────┤
│ Global       │
└──────────────┘
```

**Step 5** — `console.log()` execute hua. Uske baad:

```text
console.log() remove
        ↓
   three() remove
        ↓
     two() remove
        ↓
     one() remove
        ↓
       Global
        ↓
   Program End
```

Call Stack empty.

**Call Stack Rule**

> Function call → Push
> Function complete → Pop

```text
Push
  ↓
one()
  ↓
two()
  ↓
three()
  ↓
Pop
  ↓
three()
  ↓
two()
  ↓
one()
```

**Stack Overflow**

Suppose:

```js
function hello() {
    hello();
}

hello();
```

Ye function khud ko baar-baar call kar raha hai.

```text
hello()
  ↓
hello()
  ↓
hello()
  ↓
hello()
  ↓
hello()
  ↓
hello()
  ↓
...
```

Kabhi khali hi nahi hoga. Finally:

```text
RangeError:
Maximum call stack size exceeded
```

Isi ko **Stack Overflow** bolte hain.

---

### What is Heap Memory?

Heap Memory stores dynamically allocated objects and arrays. Variables on the stack usually hold references to these objects.

Heap Memory ka use hota hai:

- Objects
- Arrays
- Functions (internally)
- Large Data

**Example**

```js
const user = {
    name: "Raj",
    age: 20
};
```

Question: Ye object kahan store hoga? — **Heap.**

```text
Stack

user

↓

Reference

↓

Heap

┌──────────────┐
│ name : Raj   │
│ age  : 20    │
└──────────────┘
```

Dhyan do: Stack me object nahi rakha gaya. Sirf uska **reference (address)** rakha gaya. Actual object Heap me hai.

**Why Heap?**

Question: Object Stack me hi kyun nahi rakh dete?

Suppose:

```js
const student = {
    id:1,
    name:"Raj",
    age:20,
    city:"Patna",
    phone:"123",
    ...
}
```

Object bahut bada ho sakta hai. Stack bahut chhoti memory hoti hai. Heap bahut badi memory hoti hai. Isliye:

```text
Objects
   ↓
 Heap
```

**Reference Example**

```js
const user1 = {
    name:"Raj"
};

const user2 = user1;
```

```text
Stack

user1 ─────┐

user2 ─────┘

            │

            ▼

Heap

┌──────────────┐
│ name : Raj   │
└──────────────┘
```

Question: Kitne objects bane? — Sirf **ONE**.

```js
user2.name = "Aman";
```

```text
Heap

┌──────────────┐
│ name : Aman  │
└──────────────┘
```

```js
console.log(user1.name);
```

↓ **Aman**

Kyun? Dono same object ko point kar rahe hain.

**Primitive vs Object**

Primitive:

```js
let a = 10;
let b = a;
b = 50;
```

```text
Stack

a = 10
b = 50
```

Alag-alag copies.

```text
a = 10
b = 50
```

Object:

```js
const a = {
    x:10
};

const b = a;
b.x = 100;
```

```text
a.x = 100
```

Kyun? Reference copy hua.

---

### Garbage Collection

Question: Heap bhar jayega?

Answer: Nahi. V8 ke paas **Garbage Collector** hota hai. Uska kaam hai un objects ko delete karna jo kisi variable se reachable nahi hain.

**Example**

```js
let user = {
    name:"Raj"
};
```

```text
Stack

user

↓

Heap

┌─────────────┐
│ Raj         │
└─────────────┘
```

Ab:

```js
user = null;
```

```text
Stack

user

↓

null

Heap

┌─────────────┐
│ Raj         │
└─────────────┘
```

Ab problem — ye object ab kisi variable se connected hi nahi hai. Isko bolte hain **Unreachable Object**.

**Garbage Collector**

V8 time-time par check karta hai — Question: Kya koi variable is object ko point kar raha hai?

```text
Heap

┌─────────────┐
│ Raj         │
└─────────────┘
```

Answer: **No.** To → **Delete.** → Memory free.

**Reachable vs Unreachable**

Reachable:

```text
Stack

user

↓

Heap

Object
```

Garbage Collector ↓ **Don't delete.**

Unreachable:

```text
Stack

null


Heap

Object
```

Garbage Collector ↓ **Delete.**

**Real Life Analogy**

Imagine ek hostel hai.

```
Heap = Hostel ke rooms
Stack = Reception register
```

Jab koi student room leta hai:

- Register me uska room number likha jata hai (Stack → Reference)
- Student room me rehta hai (Heap → Object)

Agar student hostel chhod deta hai aur register se uska naam hata diya jata hai:

- Room ab khaali hai.
- Cleaner (Garbage Collector) aata hai aur room clean karke next student ke liye free kar deta hai.

**Complete Memory Diagram**

```text
             JavaScript Memory

        ┌─────────────────────────┐
        │        Call Stack        │
        │─────────────────────────│
        │ Global Context          │
        │ one()                   │
        │ two()                   │
        │ Local Variables         │
        └────────────┬────────────┘
                     │
          References │
                     ▼
        ┌─────────────────────────┐
        │       Heap Memory        │
        │─────────────────────────│
        │ User Object             │
        │ Product Object          │
        │ Arrays                  │
        │ Functions               │
        └─────────────────────────┘
                     │
                     ▼
          Garbage Collector cleans
          unreachable objects
```

**Interview Definitions**

**What is Call Stack?**

The Call Stack is a LIFO (Last In First Out) data structure used by the JavaScript engine to keep track of currently executing function calls, local variables, and execution contexts.

**What is Heap Memory?**

Heap Memory is a large memory area where JavaScript stores dynamically allocated data such as objects, arrays, and functions. Variables on the stack usually store references to these objects.

**What is Garbage Collection?**

Garbage Collection is an automatic memory management process performed by the V8 engine. It identifies objects that are no longer reachable from the program and frees their memory to prevent memory leaks.

**🧠 Remember This One-Liner**

```
Call Stack        → "What function is running right now?"
Heap Memory        → "Where are my objects stored?"
Garbage Collector  → "Which objects are no longer being used, so their memory can be freed?"
```

Ye teen concepts samajh gaye to Event Loop, async code, closures, memory leaks, aur Node.js internals samajhna bahut aasaan ho jata hai.

---
---

## 24. Interview Questions

**Q1. What is Node.js?**
> Node.js is a JavaScript Runtime built on Google's V8 Engine that allows JavaScript to run outside the browser and provides APIs like File System, HTTP, Streams, Crypto and many more.

**Q2. What is Runtime?**
> A Runtime is the environment responsible for executing code and providing APIs to communicate with the Operating System.

**Q3. Difference between V8 and Node.js?**

| V8 | Node.js |
|-----|----------|
| JavaScript Engine | JavaScript Runtime |
| Executes JS | Executes JS + Provides APIs |
| No File System | Has File System |
| No HTTP | Has HTTP Module |
| No Streams | Has Streams |

**Q4. What is libuv?**
> libuv is a C library used by Node.js to manage asynchronous I/O, the Event Loop, timers and the worker thread pool.

**Q5. What are C++ Bindings?**
> C++ Bindings connect JavaScript APIs with native Operating System functionality.

**Q6. Difference between Blocking and Non-Blocking I/O?**
> Blocking waits until the operation finishes. Non-Blocking starts the operation and lets JavaScript continue executing other code.

**Q7. Is Node.js Single Threaded?**
> JavaScript execution is single-threaded. Node.js runtime internally uses multiple threads through libuv.

**Q8. What is Call Stack?**
> The Call Stack is a LIFO (Last In First Out) data structure used by the JavaScript engine to keep track of currently executing function calls, local variables, and execution contexts.

**Q9. What is Heap Memory?**
> Heap Memory is a large memory area where JavaScript stores dynamically allocated data such as objects, arrays, and functions. Variables on the stack usually store references to these objects.

**Q10. What is Garbage Collection?**
> Garbage Collection is an automatic memory management process performed by the V8 engine. It identifies objects that are no longer reachable from the program and frees their memory to prevent memory leaks.

---

## 25. Key Takeaways

- ✅ JavaScript needs a Runtime.
- ✅ Browser and Node.js are different runtimes.
- ✅ V8 executes JavaScript.
- ✅ Node.js provides APIs.
- ✅ C++ Bindings connect JavaScript with native code.
- ✅ libuv handles asynchronous operations.
- ✅ Event Loop schedules callbacks.
- ✅ Thread Pool handles expensive tasks.
- ✅ JavaScript runs on one main thread.
- ✅ Objects live in Heap Memory.
- ✅ Function calls live in the Call Stack.
- ✅ Operating System performs actual work.