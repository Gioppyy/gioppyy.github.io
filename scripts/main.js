const app = document.querySelector("#app");
const delay = ms => new Promise(res => setTimeout(res, ms));
const commands = [
  ["all", "Show all commands."],
  ["whoami", "Who I am and what do I do."],
  ["project -a", "View all my public projects."],
  ["social -a", "View all my social networks."],
  ["clear", "Clear the screen."]
];

const last_command = [""];
let index = 0;

app.addEventListener("keypress", async (event) => {
  if (event.key === "Enter") {
    await delay(150);
    getInputValue();
    removeInput();
    await delay(150);
    new_line();
  }
});

app.addEventListener("keydown", (e) => {
  if (e.key === "ArrowUp") {
    const input = document.querySelector("input");
    input.value = last_command[index];
    if (index > 0) index -= 1;
    input.focus();
  }
});

app.addEventListener("click", () => {
  const input = document.querySelector("input");
  input.focus();
});

const getCommands = async (d) => {
  createText("List of commands:");
  if (d) await delay(500);
  for (const cmd of commands) {
    createCode(cmd[0], cmd[1]);
    if (d) await delay(400);
  }
};

const open_terminal = async () => {
  createText("Loading all necessary libraries..");
  await delay(900);
  createText("Starting local server at http://127.0.0.1:8080/");
  await delay(1200);
  createText("Validating credentials...");
  await delay(500);
  createText("Welcome back, root!");
  await delay(500);
  createText("---------------------------");
  await getCommands(true);
  await delay(150);
  new_line();
};

const new_line = () => {
  const p = document.createElement("p");
  const span1 = document.createElement("span");
  const span2 = document.createElement("span");
  p.setAttribute("class", "path");
  p.textContent = "root";
  span1.textContent = "@root";
  span2.textContent = ":~# ";
  p.appendChild(span1);
  p.appendChild(span2);
  app.appendChild(p);

  const div = document.createElement("div");
  div.setAttribute("class", "type");
  const i = document.createElement("i");
  i.setAttribute("class", "fas fa-angle-right icone");
  const input = document.createElement("input");
  div.appendChild(i);
  div.appendChild(input);
  app.appendChild(div);
  input.focus();
};

const escapeHTML = (str) => {
  return str.replace(/[&<>"']/g, (c) => {
    return ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;',
    })[c];
  });
};

const getInputValue = async () => {
  const input = document.querySelector("input");
  const value = input.value.trim();
  last_command.push(value);
  index = last_command.length - 1;

  if (value === "all") {
    commandResponse(true, value);
    getCommands(false);
  } else if(value === "whoami"){
    commandResponse(true, value);
    createText(`Hello! I'm <span class='green'>Michele</span> aka Gioppy.`);
    createText(`I'm <span class='green'>18 years</span> old and I have been a developer <span class='green'>since 2018</span>.`);
    createText(`I have started with small projects using the <a href='https://hub.spigotmc.org/javadocs/bukkit/' target='_blank' class='green'>Bukkit</a> API to develop Minecraft plugins.`);
    createText(`Over time, I shifted my focus to <span class='green'>CyberSecurity</span> and <span class='green'>System Administration</span>.`);
    createText(`I'm the team leader of <a href='https://codevinci.it/' target='_blank'><span class='green'>CodeVinci</span></a>, and part of 2 CTF teams that compete <span class='green'>nationally and globally</span>.`);
    createText(`We participated in:<br />
      <a href='https://cyberchallenge.it/' target='_blank'><span class='green'>CyberChallenge.IT</span></a>,
      <a href='https://uiuc.tf/' target='_blank'><span class='green'>UIUCTF</span></a>,
      <a href='https://downunderctf.com/' target='_blank'><span class='green'>DOWNUNDERCTF</span></a>.`);
    createText(`I also had the <span class='green'>opportunity</span> to be an <span class='green'>organizer</span> in these events.`);
    createText(`Languages I speak:<br />
      <span class='green'>Italian</span>,
      <span class='green'>English</span>,
      and conversational <span class='green'>Spanish</span>, <span class='green'>Arabic</span>.`);
  } else if (value === "project -a") {
    commandResponse(true, value);
    createProject("https://github.com/Gioppyy/SpaceInvader", "SpaceInvader", `A simple <span class='green'>Space Invader</span> developed with <a href='https://github.com/fondinfo/fondinfo/blob/master/g2d.py' target='_blank'><span class='green'>g2d</span></a> for an UNIPR's python course`);
    createText(`Take a view of the others public projects on my <span class='green'><a href='https://github.com/Gioppyy' target='_blank' class='green'><i class='fab fa-github blue'></i> GitHub</a></span>`);
  } else if (value === "project") {
    commandResponse(false, value);
    createText("Do you mean projects -a?");
  } else if (value === "social -a") {
    commandResponse(true, value);
    createText(`<a href='https://discord.gg' target='_blank'><i class='fab fa-discord'></i> Add me on Discord: <span class='green'>gioppy.</span></a>`);
    createText(`<a href='https://github.com/gioppyy' target='_blank'><i class='fab fa-github'></i> Follow me on github: <span class='green'>github.com/gioppyy</span></a>`);
    createText(`<a href='https://www.instagram.com/michele._.cava/' target='_blank'><i class='fab fa-instagram'></i> Follow me on Instagram: <span class='green'>instagram.com/michele._.cava</span></a>`);
  } else if (value === "social") {
    commandResponse(false, value);
    createText("Do you mean social -a?");
  } else if (value === "clear" || value === "cls") {
    document.querySelectorAll("p, section, a").forEach(e => e.remove());
  } else {
    commandResponse(false, value);
    createErrorText(`command not found: ${escapeHTML(value)}`);
  }
};

const commandResponse = (correct, command) => {
  const div = document.createElement("section");
  const mensagem = document.createElement("h2");
  const i = document.createElement("i");

  div.setAttribute("class", "type2");

  if (correct) {
    i.setAttribute("class", "fas fa-angle-right icone");
    mensagem.setAttribute("class", "sucess");
  } else {
    i.setAttribute("class", "fas fa-angle-right icone error");
    mensagem.setAttribute("class", "error");
  }

  mensagem.textContent = command;
  div.appendChild(i);
  div.appendChild(mensagem);
  app.appendChild(div);
};

const createProject = (link, title, text) => {
  const a = document.createElement("a");
  a.href = link;
  a.target = "_blank";
  a.innerHTML = `<p class="code typing-animation">${title}</p> <p><span class='text typing-animation'>${text}</span></p>`;
  app.appendChild(a);
};

const createCode = (code, text) => {
  const p = document.createElement("p");
  p.setAttribute("class", "code");
  p.innerHTML = `<span class="typing-animation">${escapeHTML(code)} <br/><span class='text'>${escapeHTML(text)}</span></span>`;
  app.appendChild(p);
};

const createText = (html) => {
  const p = document.createElement("p");
  p.innerHTML = `<span class="typing-animation">${html}</span>`;
  app.appendChild(p);
};

const createErrorText = (text) => {
  const p = document.createElement("p");
  p.innerHTML = `<span class="typing-animation error">${text}</span>`;
  app.appendChild(p);
};

const removeInput = () => {
  const div = document.querySelector(".type");
  if (div) app.removeChild(div);
};
