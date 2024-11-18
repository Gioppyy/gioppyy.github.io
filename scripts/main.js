
const app = document.querySelector("#app");
const delay = ms => new Promise(res => setTimeout(res, ms));
    
    
app.addEventListener("keypress", async function(event){
  if(event.key === "Enter"){
    await delay(150);
   getInputValue();
   
    removeInput();
    await delay(150);
    new_line();
  }
});

app.addEventListener("click", function(event){
  const input = document.querySelector("input");
  input.focus();
})


async function open_terminal(){
  createText("Loading all necessary libraries..")
  await delay(700);
  createText("Starting local server at http://127.0.0.1:8080/");
  await delay(700);
  createText("Validating credentials...")
  await delay(700);
  createText("Welcome back, root!")
  await delay(400);

  createText("---------------------------");
  createText("List of commands:")
  await delay(100);
  createCode("all", "Show all commands.");
  await delay(100);
  createCode("whoami", "Who i am and what do i do.");
  await delay(100);
  createCode("project -a", "View all my public projects.");
  await delay(100);
  createCode("contacts -a", "View all my social networks.");
  await delay(100);
  createCode("clear", "clear the screen.");
  await delay(100);

  await delay(500);
  new_line();
}


function new_line(){
  
  const p = document.createElement("p");
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  p.setAttribute("class", "path")
  p.textContent = "root";
  span1.textContent = "@root"
  span2.textContent = ":~# ";
  p.appendChild(span1)
  p.appendChild(span2);
  app.appendChild(p);
  const div = document.createElement("div");
  div.setAttribute("class", "type")
  const i = document.createElement("i");
  i.setAttribute("class", "fas fa-angle-right icone")
  const input = document.createElement("input");
  div.appendChild(i);
  div.appendChild(input);
  app.appendChild(div);
  input.focus();
}

function removeInput(){
  const div = document.querySelector(".type");
  app.removeChild(div);
}

async function getInputValue(){
  
  const value = document.querySelector("input").value.trim();
  if(value === "all"){
    trueValue(value);
    createText("List of commands:")
    createCode("all", "Show all commands.");
    createCode("whoami", "Who i am and what do i do.");
    createCode("project -a", "View all my public projects.");
    createCode("social -a", "View all my social networks.");
    createCode("clear", "clear the screen.");
  }
  else if(value === "whoami"){
    trueValue(value);
    createText("Hello! I'm <span class='blue'>Michele</span>.")
    createText("I'm <span class='blue'>18 years</span> old and I have been a developer <span class='blue'>since 2018</span>. \
      <br />I have started with small projects using the <a href='https://hub.spigotmc.org/javadocs/bukkit/' target='_blank' class='blue'>Bukkit </a> API to develop Minecraft plugins. \
      <br /><br />Over time, I shifted my focus to <span class='blue'>cybersecurity</span> and <span class='blue'>system administration</span> and now, \
      I'm part of <span class='blue'>3</span> CTF teams that compete <span class='blue'>nationally and globally</span>, and with them I .\
      <br /><br />I speak two languages fluently: <span class='blue'>Italian</span> and <span class='blue'>English</span>. I also have <span class='blue'>conversational</span> proficiency in French, Spanish, and Arabic.")
  }
  else if(value === "projects -a"){
    trueValue(value);
    createText("Take a view of my public projects on my \
      <span class='blue'> \
      <a href='https://github.com/Gioppyy' target='_blank' class='blue'> \
      <i class='fab fa-github blue'></i> GitHub</a> \
      </span>")
  }
  else if(value === "projects"){
    falseValue(value);
    createText("Do you mean projects -a?")
  }
  else if(value === "social -a"){
    trueValue(value);
    createText("<a href='https://discord.gg' target='_blank'><i class='fab fa-discord white'></i> Add me on Discord: <span class='blue'>gioppy.</span></a>")
    createText("<a href='https://github.com/gioppyy' target='_blank'><i class='fab fa-github white'></i> Follow me on github: <span class='blue'>github.com/gioppyy</span></a>")
    createText("<a href='https://www.instagram.com/michele._.cava/' target='_blank'><i class='fab fa-instagram white'></i> Follow me on Instagram: <span class='blue'>instagram.com/michele._.cava</span></a>")
  }
  else if(value === "social"){
    falseValue(value);
    createText("Do you mean social -a?")
  }
  else if(value === "clear" || value === "cls"){
    document.querySelectorAll("p").forEach(e => e.parentNode.removeChild(e));
    document.querySelectorAll("section").forEach(e => e.parentNode.removeChild(e));
  }
  else{
    falseValue(value);
    createErrorText(`command not found: ${value}`)
  }
}

function trueValue(value){
  
  const div = document.createElement("section");
  div.setAttribute("class", "type2")
  const i = document.createElement("i");
  i.setAttribute("class", "fas fa-angle-right icone")
  const mensagem = document.createElement("h2");
  mensagem.setAttribute("class", "sucess")
  mensagem.textContent = `${value}`;
  div.appendChild(i);
  div.appendChild(mensagem);
  app.appendChild(div);
}

function falseValue(value){
  
  const div = document.createElement("section");
  div.setAttribute("class", "type2")
  const i = document.createElement("i");
  i.setAttribute("class", "fas fa-angle-right icone error")
  const mensagem = document.createElement("h2");
  mensagem.setAttribute("class", "error")
  mensagem.textContent = `${value}`;
  div.appendChild(i);
  div.appendChild(mensagem);
  app.appendChild(div);
}

function createText(text, classname) {
  const p = document.createElement("p");
  
  p.innerHTML = text;
  app.appendChild(p);
}

function createErrorText(text) {
  const p = document.createElement("p");
  p.innerText = text;
  app.appendChild(p);
}

function createCode(code, text){
  const p = document.createElement("p");
  p.setAttribute("class", "code");
  p.innerHTML =
  `${code} <br/><span class='text'> ${text} </span>`;
  app.appendChild(p);
}

open_terminal();