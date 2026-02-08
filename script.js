const screens = {
  start: document.getElementById("start-screen"),
  achievements: document.getElementById("achievements-screen"),
  game: document.getElementById("game-screen"),
};

const startButton = document.getElementById("start-game");
const achievementsButton = document.getElementById("open-achievements");
const backToStartButton = document.getElementById("back-to-start");
const returnToStartButton = document.getElementById("return-to-start");

const roomsList = document.getElementById("rooms-list");
const roomTitle = document.getElementById("room-title");
const roomDescription = document.getElementById("room-description");
const roomActions = document.getElementById("room-actions");
const inventoryList = document.getElementById("inventory-list");
const charactersList = document.getElementById("characters-list");
const coinsDisplay = document.getElementById("coins-display");
const locationHint = document.getElementById("location-hint");

const dialog = document.getElementById("dialog");
const dialogTitle = document.getElementById("dialog-title");
const dialogText = document.getElementById("dialog-text");
const dialogActions = document.getElementById("dialog-actions");
const dialogExtra = document.getElementById("dialog-extra");

const gameOver = document.getElementById("game-over");
const gameOverText = document.getElementById("game-over-text");
const restartGameButton = document.getElementById("restart-game");

const achievementsList = document.getElementById("achievements-list");

const INGREDIENTS = [
  "ail",
  "oignon",
  "huile d'olive",
  "riz",
  "ratatouille",
  "steak",
  "poulet",
];

const GOOD_RECIPE = new Set(["ail", "oignon", "huile d'olive", "poulet"]);

const achievements = {
  ending: {
    title: "LA FIN ?",
    description: "Finir le jeu.",
    unlocked: false,
  },
  coma: {
    title: "COMA ÉTHYLIQUE",
    description: "Mourir en buvant l'alcool de foin.",
    unlocked: false,
  },
  indigestion: {
    title: "INDIGESTION",
    description: "Mourir en mangeant un plat douteux.",
    unlocked: false,
  },
  investor: {
    title: "INVESTISSEUR",
    description: "Ramener 20 euros à Nicolas avant la fin du jeu.",
    unlocked: false,
  },
  green: {
    title: "GÉANT VERT",
    description: "Trouver le costume du géant vert (skin Walid vert).",
    unlocked: false,
  },
  invisible: {
    title: "HOMME INVISIBLE",
    description: "Rester 10 min dans la chambre de Walid sans bouger.",
    unlocked: false,
  },
};

let gameState;
let idleTimer;

const rooms = [
  {
    id: "couloir-etage",
    name: "Couloir Étage",
    description:
      "Un couloir avec trois portes. À gauche la salle de bain, à droite l'escalier vers le RDC.",
    actions: ["Observer les portes"],
    characters: [],
  },
  {
    id: "chambre-nicolas",
    name: "Chambre Nicolas",
    description: "Nicolas est là, intriguant avec ses plans d'investissement.",
    actions: ["Regarder le bureau"],
    characters: ["Nicolas"],
  },
  {
    id: "chambre-guillaume",
    name: "Chambre Guillaume",
    description: "Une chambre rangée. Guillaume n'est pas toujours là.",
    actions: ["Regarder autour"],
    characters: ["Guillaume"],
  },
  {
    id: "chambre-walid",
    name: "Chambre Walid",
    description: "La chambre de Walid. Une ambiance familière.",
    actions: ["Regarder sous le lit"],
    characters: [],
  },
  {
    id: "salle-bain-etage",
    name: "Salle de bain (Étage)",
    description: "Tout est calme. Rien à signaler.",
    actions: ["Se rafraîchir"],
    characters: [],
  },
  {
    id: "escalier",
    name: "Escalier",
    description: "L'escalier descend vers le RDC.",
    actions: [],
    characters: [],
  },
  {
    id: "entree-rdc",
    name: "Entrée RDC",
    description:
      "En bas de l'escalier, un grand espace ouvre sur la cuisine et un couloir.",
    actions: [],
    characters: [],
  },
  {
    id: "cuisine",
    name: "Cuisine",
    description: "Ça sent bon l'ail et l'oignon...",
    actions: ["Regarder le lave-vaisselle", "Regarder la machine à laver"],
    characters: ["Quentin", "Mark"],
  },
  {
    id: "salon",
    name: "Salon / Salle à manger",
    description: "Des canapés confortables et une télé allumée.",
    actions: ["Regarder la télévision", "S'asseoir sur un canapé"],
    characters: ["David", "Pauline"],
  },
  {
    id: "couloir-rdc",
    name: "Couloir RDC",
    description:
      "Un couloir qui mène à la chambre de Mark, la salle de bain et les WC.",
    actions: ["Regarder autour"],
    characters: [],
  },
  {
    id: "chambre-mark",
    name: "Chambre Mark",
    description: "Mark est là, concentré sur quelque chose.",
    actions: [],
    characters: ["Mark"],
  },
  {
    id: "salle-bain-rdc",
    name: "Salle de bain (RDC)",
    description: "Un lavabo qui brille.",
    actions: ["Regarder le lavabo"],
    characters: [],
  },
  {
    id: "wc-rdc",
    name: "WC (RDC)",
    description: "Les WC du bas. Un endroit un peu étrange.",
    actions: ["Inspecter"],
    characters: [],
  },
  {
    id: "petite-piece",
    name: "Petite pièce",
    description: "Une petite pièce près du salon, à côté de la télé.",
    actions: ["Examiner l'objet étrange"],
    characters: [],
  },
  {
    id: "armoire",
    name: "Armoire",
    description: "Une armoire vide dans un petit couloir.",
    actions: ["Regarder dedans"],
    characters: [],
  },
];

const coinsByRoom = {
  "couloir-etage": 2,
  "chambre-nicolas": 2,
  "chambre-guillaume": 2,
  "chambre-walid": 2,
  "entree-rdc": 2,
  cuisine: 2,
  salon: 2,
  "couloir-rdc": 2,
  "chambre-mark": 2,
  "salle-bain-rdc": 2,
  "wc-rdc": 2,
};

function initGameState() {
  gameState = {
    roomId: "entree-rdc",
    inventory: new Set(),
    coins: 0,
    coinsTaken: {},
    flags: {
      quentinPaid: false,
      hasSucculent: false,
      markBusy: true,
      markMad: false,
      sofaBroken: false,
      guillaumePresent: false,
      guillaumeHelped: false,
      nicolasAsked: false,
      nicolasInvested: false,
      paulineAppeared: false,
      gameFinished: false,
      invisibleUnlocked: false,
    },
  };
}

function showScreen(screen) {
  Object.values(screens).forEach((section) => section.classList.remove("active"));
  screens[screen].classList.add("active");
}

function renderAchievements() {
  achievementsList.innerHTML = "";
  Object.entries(achievements).forEach(([key, value]) => {
    const card = document.createElement("div");
    card.className = `achievement-card ${value.unlocked ? "" : "locked"}`;
    card.innerHTML = `
      <h3>${value.title}</h3>
      <p>${value.description}</p>
      <strong>${value.unlocked ? "Déverrouillé" : "Verrouillé"}</strong>
    `;
    achievementsList.appendChild(card);
  });
}

function updateRoomButtons() {
  roomsList.innerHTML = "";
  rooms.forEach((room) => {
    const button = document.createElement("button");
    button.textContent = room.name;
    button.className = room.id === gameState.roomId ? "active" : "";
    button.addEventListener("click", () => {
      changeRoom(room.id);
    });
    roomsList.appendChild(button);
  });
}

function updateInventory() {
  inventoryList.innerHTML = "";
  const items = Array.from(gameState.inventory).sort();
  if (items.length === 0) {
    inventoryList.innerHTML = "<li>Aucun objet</li>";
    return;
  }
  items.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item;
    inventoryList.appendChild(li);
  });
}

function updateCharacters(room) {
  charactersList.innerHTML = "";
  const characters = getActiveCharacters(room.id);
  if (characters.length === 0) {
    charactersList.innerHTML = "<li>Personne ici</li>";
    return;
  }
  characters.forEach((name) => {
    const li = document.createElement("li");
    li.textContent = name;
    li.addEventListener("click", () => handleCharacterInteraction(name));
    charactersList.appendChild(li);
  });
}

function updateRoomScene() {
  const room = rooms.find((r) => r.id === gameState.roomId);
  roomTitle.textContent = room.name;
  roomDescription.textContent = getRoomDescription(room);
  locationHint.textContent = `Étape en cours : ${getProgressHint()}`;
  roomActions.innerHTML = "";

  const actions = getRoomActions(room);
  actions.forEach((action) => {
    const button = document.createElement("button");
    button.textContent = action.label;
    button.addEventListener("click", action.onClick);
    roomActions.appendChild(button);
  });

  updateCharacters(room);
  updateInventory();
  updateRoomButtons();
  coinsDisplay.textContent = `${gameState.coins} €`;
}

function changeRoom(roomId) {
  gameState.roomId = roomId;
  if (roomId !== "chambre-walid") {
    clearIdleTimer();
  } else {
    startIdleTimer();
  }
  updateRoomScene();
}

function getRoomDescription(room) {
  if (room.id === "cuisine") {
    if (!gameState.flags.quentinPaid) {
      return "hmmmmm ça sent bon l'aïl et l'oignon.";
    }
    if (gameState.flags.markMad) {
      return "Mark est là, l'air énervé, proche de la machine à laver.";
    }
  }
  if (room.id === "chambre-guillaume" && !gameState.flags.guillaumePresent) {
    return "Guillaume doit être à la salle de sport.";
  }
  if (room.id === "salon" && gameState.flags.paulineAppeared) {
    return "Pauline est apparue dans la salle à manger.";
  }
  return room.description;
}

function getRoomActions(room) {
  const actions = [];
  if (coinsByRoom[room.id] && !gameState.coinsTaken[room.id]) {
    actions.push({
      label: `Ramasser ${coinsByRoom[room.id]} €`,
      onClick: () => collectCoins(room.id),
    });
  }

  room.actions.forEach((action) => {
    actions.push({ label: action, onClick: () => handleRoomAction(room.id, action) });
  });

  return actions;
}

function getActiveCharacters(roomId) {
  if (roomId === "chambre-guillaume" && !gameState.flags.guillaumePresent) {
    return [];
  }
  if (roomId === "cuisine" && !gameState.flags.markMad) {
    return ["Quentin"];
  }
  if (roomId === "salon" && !gameState.flags.paulineAppeared) {
    return ["David"];
  }
  if (roomId === "salon" && gameState.flags.paulineAppeared) {
    return ["David", "Pauline"];
  }
  if (roomId === "chambre-mark" && !gameState.flags.markBusy) {
    return [];
  }
  const room = rooms.find((r) => r.id === roomId);
  return room.characters;
}

function collectCoins(roomId) {
  const amount = coinsByRoom[roomId];
  gameState.coins += amount;
  gameState.coinsTaken[roomId] = true;
  if (gameState.coins >= 20 && !achievements.investor.unlocked) {
    gameState.flags.nicolasInvested = true;
  }
  updateRoomScene();
}

function getProgressHint() {
  const needed = ["lampe frontale", "tenue de randonnée", "opinel", "sac de couchage"];
  const found = needed.filter((item) => gameState.inventory.has(item));
  if (found.length === 4) {
    return "Tous les objets sont réunis.";
  }
  return `${found.length}/4 objets trouvés`;
}

function handleRoomAction(roomId, action) {
  if (roomId === "cuisine" && action === "Regarder le lave-vaisselle") {
    showDialog("Cuisine", "Pas besoin, il y a Guillaume, mets dans l'évier.", [{ label: "OK" }]);
    return;
  }
  if (roomId === "cuisine" && action === "Regarder la machine à laver") {
    if (gameState.flags.markMad) {
      addToInventory("tenue de randonnée");
      showDialog(
        "Machine à laver",
        "C'est quoi cette odeur ? Je crois que ça vient de la machine à laver... je vais lui donner un coup pour l'ouvrir...",
        [{ label: "Super" }]
      );
    } else {
      showDialog("Machine à laver", "Nicolas a encore bourré la machine... c'est bloqué...", [{ label: "OK" }]);
    }
    return;
  }
  if (roomId === "salon" && action === "Regarder la télévision") {
    showDialog(
      "Télévision",
      "Oh une partie de smash est en cours, je ferais mieux de m'éloigner, l'atmosphère a l'air tendu...",
      [{ label: "OK" }]
    );
    return;
  }
  if (roomId === "salon" && action === "S'asseoir sur un canapé") {
    if (!gameState.flags.sofaBroken) {
      gameState.flags.sofaBroken = true;
      gameState.flags.markMad = true;
      gameState.flags.markBusy = false;
      showDialog("CRACK!", "Oulah, j'espère que Mark ne va rien dire...", [{ label: "Oups" }]);
      updateRoomScene();
    } else {
      showDialog("Canapé", "Le canapé est déjà cassé...", [{ label: "OK" }]);
    }
    return;
  }
  if (roomId === "wc-rdc" && action === "Inspecter") {
    if (!gameState.inventory.has("bout de dent")) {
      addToInventory("bout de dent");
      showDialog("WC", "Tu trouves un bout de dent... étrange.", [{ label: "OK" }]);
    } else {
      showDialog("WC", "Rien d'autre à signaler ici.", [{ label: "OK" }]);
    }
    return;
  }
  if (roomId === "salle-bain-rdc" && action === "Regarder le lavabo") {
    showDialog("Lavabo", "Oh du savon, et si je faisais une soirée mousse ?", [{ label: "OK" }]);
    return;
  }
  if (roomId === "petite-piece" && action === "Examiner l'objet étrange") {
    if (!gameState.inventory.has("bouteille d'alcool de foin")) {
      addToInventory("bouteille d'alcool de foin");
      showDialog("Easter egg", "Tu obtiens une bouteille d'alcool de foin.", [
        {
          label: "Boire la bouteille",
          onClick: () => triggerGameOver("coma"),
        },
        { label: "Ne pas boire" },
      ]);
    } else {
      showDialog(
        "Easter egg",
        "Boire la bouteille ?",
        [
          {
            label: "Oui",
            onClick: () => triggerGameOver("coma"),
          },
          { label: "Non" },
        ]
      );
    }
    return;
  }
  if (roomId === "couloir-rdc" && action === "Regarder autour") {
    if (!gameState.inventory.has("balle de ping pong")) {
      showDialog(
        "Couloir",
        "Tiens une balle de ping pong, mais qu'est-ce qu'elle fait là ?",
        [
          {
            label: "Ramasser",
            onClick: () => {
              addToInventory("balle de ping pong");
              gameState.flags.guillaumePresent = true;
              updateRoomScene();
            },
          },
          { label: "Laisser" },
        ]
      );
    } else {
      showDialog("Couloir", "Rien d'autre ici.", [{ label: "OK" }]);
    }
    return;
  }
  if (roomId === "chambre-walid" && action === "Regarder sous le lit") {
    if (!achievements.green.unlocked) {
      achievements.green.unlocked = true;
      showDialog("Succès", "Costume du géant vert trouvé ! Skin Walid vert débloqué.", [{ label: "OK" }]);
      renderAchievements();
    } else {
      showDialog("Sous le lit", "Tu retrouves juste quelques chaussettes.", [{ label: "OK" }]);
    }
    return;
  }
  if (roomId === "armoire" && action === "Regarder dedans") {
    showDialog("Armoire", "Juste une armoire vide.", [{ label: "OK" }]);
    return;
  }
  showDialog("", "Rien de spécial ici.", [{ label: "OK" }]);
}

function handleCharacterInteraction(name) {
  switch (name) {
    case "Quentin":
      handleQuentin();
      break;
    case "David":
      handleDavid();
      break;
    case "Guillaume":
      handleGuillaume();
      break;
    case "Mark":
      handleMark();
      break;
    case "Nicolas":
      handleNicolas();
      break;
    case "Pauline":
      handlePauline();
      break;
    default:
      showDialog(name, "Rien à dire.", [{ label: "OK" }]);
  }
}

function handleQuentin() {
  if (!gameState.flags.quentinPaid) {
    showDialog("Quentin", "Quoi ? Tu veux une part de ce que je cuisine ?", [
      {
        label: "Oui",
        onClick: () => {
          if (gameState.coins < 2) {
            showDialog("Quentin", "Tu connais mes tarifs, trouve 2€ pour goûter.", [{ label: "OK" }]);
          } else {
            gameState.coins -= 2;
            gameState.flags.quentinPaid = true;
            showCookingMiniGame();
          }
          updateRoomScene();
        },
      },
      { label: "Non" },
    ]);
    return;
  }

  if (!gameState.flags.hasSucculent) {
    showCookingMiniGame();
    return;
  }

  showDialog("Quentin", "Bon appétit, tu sais ce qu'il te reste à faire.", [{ label: "OK" }]);
}

function showCookingMiniGame() {
  const instructions = achievements.indigestion.unlocked
    ? `Tu devrais essayer « ${getHintIngredients().join(" » et « ")} » avec deux autres ingrédients.`
    : "Choisis 4 ingrédients pour cuisiner.";

  dialogTitle.textContent = "Mini-jeu cuisine";
  dialogText.textContent = instructions;
  dialogExtra.innerHTML = "";
  dialogActions.innerHTML = "";

  const selections = new Set();
  const ingredientsContainer = document.createElement("div");
  ingredientsContainer.className = "actions";

  INGREDIENTS.forEach((ingredient) => {
    const button = document.createElement("button");
    button.textContent = ingredient;
    button.addEventListener("click", () => {
      if (selections.has(ingredient)) {
        selections.delete(ingredient);
        button.classList.remove("active");
      } else if (selections.size < 4) {
        selections.add(ingredient);
        button.classList.add("active");
      }
    });
    ingredientsContainer.appendChild(button);
  });

  dialogExtra.appendChild(ingredientsContainer);

  dialogActions.appendChild(
    createDialogButton("Cuisiner", () => {
      if (selections.size < 4) {
        dialogText.textContent = "Il faut sélectionner 4 ingrédients.";
        return;
      }
      const success = isGoodRecipe(selections);
      if (success) {
        gameState.flags.hasSucculent = true;
        addToInventory("plat succulent");
        showDialog("Quentin", "Plat succulent préparé !", [{ label: "Super" }]);
      } else {
        addToInventory("plat douteux");
        showDialog("Quentin", "Plat douteux... Ça n'a pas l'air fou.", [
          {
            label: "Manger le plat douteux",
            onClick: () => triggerGameOver("indigestion"),
          },
          {
            label: "Réessayer une autre recette",
            onClick: () => {
              removeFromInventory("plat douteux");
              showCookingMiniGame();
            },
          },
        ]);
      }
    })
  );

  dialogActions.appendChild(createDialogButton("Annuler"));

  dialog.classList.remove("hidden");
}

function isGoodRecipe(selections) {
  if (selections.size !== GOOD_RECIPE.size) {
    return false;
  }
  return [...selections].every((ingredient) => GOOD_RECIPE.has(ingredient));
}

function getHintIngredients() {
  return Array.from(GOOD_RECIPE)
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
}

function handleDavid() {
  if (!gameState.inventory.has("plat succulent")) {
    showDialog("David", "Ah j'ai faim, ça fait 24h que je n'ai pas mangé...", [{ label: "OK" }]);
    return;
  }
  showDialog("David", "Hmmm ça sent bon, qu'est-ce que tu as là ?", [
    {
      label: "Donner le plat",
      onClick: () => {
        removeFromInventory("plat succulent");
        addToInventory("sac de couchage");
        showDialog("David", "Merci Walid, tiens prends ça, tu en auras plus besoin que moi.", [
          { label: "Merci" },
        ]);
      },
    },
    { label: "Pas maintenant" },
  ]);
}

function handleGuillaume() {
  if (!gameState.inventory.has("balle de ping pong")) {
    showDialog("Guillaume", "Oh mec, tu as trouvé la balle de ping pong ?", [{ label: "Non" }]);
    return;
  }
  if (!gameState.flags.guillaumeHelped) {
    showDialog("Guillaume", "Oh mec tu as trouvé la balle de ping pong ?", [
      {
        label: "Donner la balle",
        onClick: () => {
          gameState.flags.guillaumeHelped = true;
          removeFromInventory("balle de ping pong");
          addToInventory("opinel");
          showDialog(
            "Guillaume",
            "Tu ne devineras jamais ce qui m'est arrivé hier soir... Un mec random s'est mis à poil dans ma chambre et m'a jeté une balle de ping pong. Depuis je garde toujours un opinel avec moi, tu devrais faire pareil, tiens c'est cadeau.",
            [{ label: "Merci" }]
          );
        },
      },
      { label: "Non" },
    ]);
    return;
  }
  showDialog("Guillaume", "Prends soin de toi !", [{ label: "OK" }]);
}

function handleMark() {
  if (gameState.flags.markBusy) {
    showDialog("Mark", "Ne répond pas... il a l'air occupé...", [
      {
        label: "Aller attendre dans le canapé",
        onClick: () => {
          changeRoom("salon");
        },
      },
      { label: "OK" },
    ]);
    return;
  }
  if (gameState.flags.markMad) {
    if (gameState.roomId === "cuisine") {
      showDialog(
        "Mark",
        "C'est quoi cette odeur ? Je crois que ça vient de la machine à laver... je vais lui donner un coup pour l'ouvrir...",
        [{ label: "OK" }]
      );
      return;
    }
    showDialog("Mark", "Tu as cassé mon canapé ! Je m'en vais dans la cuisine.", [{ label: "Oups" }]);
    return;
  }
  showDialog("Mark", "Il n'est plus là.", [{ label: "OK" }]);
}

function handleNicolas() {
  if (gameState.inventory.has("bout de dent")) {
    removeFromInventory("bout de dent");
    addToInventory("lampe frontale");
    showDialog(
      "Nicolas",
      "Oh ma dent ! Merci de me l'avoir ramenée, tiens, prends donc cette lampe frontale.",
      [{ label: "OK" }]
    );
    return;
  }

  if (gameState.flags.nicolasInvested && !achievements.investor.unlocked) {
    achievements.investor.unlocked = true;
    renderAchievements();
    showDialog(
      "Nicolas",
      "Ah oui, bien joué mec pour ce premier investissement, as-tu entendu parler du BidCoin ?",
      [{ label: "Euh..." }]
    );
    return;
  }

  if (!gameState.flags.nicolasAsked) {
    gameState.flags.nicolasAsked = true;
    showDialog("Nicolas", "Yo mec, ça te dirait d'investir avec moi ?", [
      {
        label: "Oui",
        onClick: () => {
          showDialog("", "2 hours later...", [
            {
              label: "Continuer",
              onClick: () => {
                showDialog("Nicolas", "Si tu trouves 50 euros, reviens me voir pour investir.", [
                  { label: "OK" },
                ]);
              },
            },
          ]);
        },
      },
      {
        label: "Non",
        onClick: () => {
          showDialog("Nicolas", "Eh ! C'est pas un ponzi, ok !", [{ label: "OK" }]);
        },
      },
    ]);
    return;
  }

  showDialog("Nicolas", "Toujours partant pour investir ?", [{ label: "OK" }]);
}

function handlePauline() {
  if (!gameState.flags.paulineAppeared) {
    return;
  }
  showDialog(
    "Pauline",
    "Bravo mon choupinou, as-tu une idée plus précise de ce qu'il va t'arriver ?",
    [
      {
        label: "To be continued...",
        onClick: () => finishGame(),
      },
    ]
  );
}

function finishGame() {
  achievements.ending.unlocked = true;
  renderAchievements();
  showScreen("start");
  initGameState();
  updateRoomScene();
}

function addToInventory(item) {
  gameState.inventory.add(item);
  updateRoomScene();
  checkCompletion();
}

function removeFromInventory(item) {
  gameState.inventory.delete(item);
  updateRoomScene();
}

function checkCompletion() {
  const required = ["lampe frontale", "tenue de randonnée", "opinel", "sac de couchage"];
  if (required.every((item) => gameState.inventory.has(item))) {
    gameState.flags.paulineAppeared = true;
    updateRoomScene();
  }
}

function showDialog(title, text, actions = [{ label: "OK" }]) {
  dialogTitle.textContent = title;
  dialogText.textContent = text;
  dialogExtra.innerHTML = "";
  dialogActions.innerHTML = "";

  actions.forEach((action) => {
    dialogActions.appendChild(createDialogButton(action.label, action.onClick));
  });

  dialog.classList.remove("hidden");
}

function createDialogButton(label, onClick) {
  const button = document.createElement("button");
  button.textContent = label;
  button.addEventListener("click", () => {
    dialog.classList.add("hidden");
    if (onClick) {
      onClick();
    }
  });
  return button;
}

function triggerGameOver(type) {
  if (type === "coma") {
    achievements.coma.unlocked = true;
    gameOverText.textContent =
      "Tu as bu la bouteille d'alcool de foin. Coma éthylique ! Le jeu redémarre.";
  }
  if (type === "indigestion") {
    achievements.indigestion.unlocked = true;
    gameOverText.textContent =
      "Tu as mangé un plat douteux. Indigestion ! Le jeu redémarre.";
  }
  renderAchievements();
  dialog.classList.add("hidden");
  gameOver.classList.remove("hidden");
}

function startIdleTimer() {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    achievements.invisible.unlocked = true;
    renderAchievements();
    showDialog("Succès", "Skin Walid transparent débloqué !", [{ label: "OK" }]);
  }, 10 * 60 * 1000);
}

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
  }
}

startButton.addEventListener("click", () => {
  initGameState();
  showScreen("game");
  updateRoomScene();
});

achievementsButton.addEventListener("click", () => {
  renderAchievements();
  showScreen("achievements");
});

backToStartButton.addEventListener("click", () => {
  showScreen("start");
});

returnToStartButton.addEventListener("click", () => {
  showScreen("start");
});

restartGameButton.addEventListener("click", () => {
  gameOver.classList.add("hidden");
  initGameState();
  showScreen("game");
  updateRoomScene();
});

window.addEventListener("click", (event) => {
  if (event.target === dialog) {
    dialog.classList.add("hidden");
  }
});

initGameState();
renderAchievements();
updateRoomScene();
