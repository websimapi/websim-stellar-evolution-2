// Initialize WebsimSocket for multiplayer functionality
const room = new WebsimSocket();

// Game constants
const RESOURCES = {
  ENERGY: 'energy',
  MINERALS: 'minerals',
  KNOWLEDGE: 'knowledge',
  POPULATION: 'population'
};

const TECH_CATEGORIES = {
  ENERGY: 'energy',
  PROPULSION: 'propulsion',
  COMPUTING: 'computing',
  MATERIALS: 'materials',
  BIOLOGY: 'biology'
};

// Initial game state
const initialGameState = {
  resources: {
    [RESOURCES.ENERGY]: { amount: 100, rate: 2 },
    [RESOURCES.MINERALS]: { amount: 100, rate: 1 },
    [RESOURCES.KNOWLEDGE]: { amount: 50, rate: 1 },
    [RESOURCES.POPULATION]: { amount: 1000, rate: 5 }
  },
  planets: [
    {
      id: 'home',
      name: 'Terra Prime',
      discovered: true,
      colonized: true,
      type: 'terrestrial',
      resources: {
        [RESOURCES.ENERGY]: 100,
        [RESOURCES.MINERALS]: 100,
        [RESOURCES.KNOWLEDGE]: 10
      },
      population: 1000
    }
  ],
  starSystems: [
    {
      id: 'sol',
      name: 'Sol System',
      discovered: true,
      explored: false,
      planets: ['home']
    }
  ],
  technologies: {
    [TECH_CATEGORIES.ENERGY]: {
      researched: ['basic-solar'],
      researching: null,
      available: ['advanced-solar', 'nuclear-fission']
    },
    [TECH_CATEGORIES.PROPULSION]: {
      researched: ['chemical-rockets'],
      researching: null,
      available: ['ion-drives']
    },
    [TECH_CATEGORIES.COMPUTING]: {
      researched: ['basic-computing'],
      researching: null,
      available: ['advanced-algorithms']
    },
    [TECH_CATEGORIES.MATERIALS]: {
      researched: ['metallurgy'],
      researching: null,
      available: ['composites']
    },
    [TECH_CATEGORIES.BIOLOGY]: {
      researched: ['basic-agriculture'],
      researching: null,
      available: ['hydroponics']
    }
  },
  explorationProgress: 0,
  lastCommandTime: Date.now(),
  messages: [
    {
      text: "Welcome to Stellar Evolution. You are the leader of a fledgling civilization on Terra Prime, your home planet. Your journey to the stars begins now.",
      type: "development"
    },
    {
      text: "Your advisors await your commands. Try directing your scientists to research technology, your explorers to survey nearby space, or build infrastructure to boost your resource production.",
      type: "exploration"
    }
  ]
};

// Natural Language Processing functions
const nlpCommandTypes = {
  EXPLORE: ['explore', 'survey', 'scout', 'investigate', 'search', 'discover'],
  RESEARCH: ['research', 'study', 'develop', 'technology', 'science', 'advance'],
  BUILD: ['build', 'construct', 'create', 'establish', 'found', 'settle', 'colonize'],
  RESOURCE: ['allocate', 'assign', 'distribute', 'focus', 'prioritize', 'harvest', 'mine'],
  DIPLOMACY: ['contact', 'negotiate', 'alliance', 'treaty', 'trade', 'diplomatic']
};

function parseCommand(command) {
  command = command.toLowerCase();
  
  // Determine command type
  let commandType = null;
  
  for (const [type, keywords] of Object.entries(nlpCommandTypes)) {
    if (keywords.some(keyword => command.includes(keyword))) {
      commandType = type;
      break;
    }
  }
  
  return {
    type: commandType || 'UNKNOWN',
    raw: command
  };
}

function processCommand(command, gameState) {
  const parsed = parseCommand(command);
  let newState = {...gameState};
  let response = { text: "", type: "development" };
  
  switch (parsed.type) {
    case 'EXPLORE':
      if (parsed.raw.includes('system') || parsed.raw.includes('space') || parsed.raw.includes('star')) {
        response.text = "Your explorers set out to survey nearby space. Their scanners detect unusual activity in a neighboring star system.";
        response.type = "exploration";
        newState.explorationProgress += 15;
        
        // If exploration progress is sufficient, discover a new star system
        if (newState.explorationProgress >= 100) {
          const newStarSystem = {
            id: `system-${Date.now()}`,
            name: 'Alpha Centauri',
            discovered: true,
            explored: false,
            planets: []
          };
          
          const newPlanet = {
            id: `planet-${Date.now()}`,
            name: 'Proxima b',
            discovered: true,
            colonized: false,
            type: 'terrestrial',
            resources: {
              [RESOURCES.ENERGY]: Math.floor(Math.random() * 100) + 50,
              [RESOURCES.MINERALS]: Math.floor(Math.random() * 150) + 100,
              [RESOURCES.KNOWLEDGE]: Math.floor(Math.random() * 30) + 10
            },
            population: 0
          };
          
          newStarSystem.planets.push(newPlanet.id);
          newState.planets.push(newPlanet);
          newState.starSystems.push(newStarSystem);
          newState.explorationProgress = 0;
          
          response.text = `Breakthrough! Your explorers have discovered a new star system: ${newStarSystem.name}. Initial scans reveal a promising planet orbiting the star: ${newPlanet.name}. This could be a potential site for colonization.`;
        }
      } else if (parsed.raw.includes('planet') || parsed.raw.includes('world')) {
        response.text = "Your survey teams deploy probes to analyze the planet's surface. They discover interesting geological formations that might contain valuable minerals.";
        response.type = "exploration";
        newState.resources[RESOURCES.MINERALS].amount += 20;
      } else {
        response.text = "Your explorers venture forth, mapping uncharted areas and collecting data about your surroundings.";
        response.type = "exploration";
      }
      break;
      
    case 'RESEARCH':
      if (parsed.raw.includes('solar') || parsed.raw.includes('energy')) {
        if (!newState.technologies[TECH_CATEGORIES.ENERGY].researched.includes('advanced-solar')) {
          newState.technologies[TECH_CATEGORIES.ENERGY].researched.push('advanced-solar');
          newState.technologies[TECH_CATEGORIES.ENERGY].available.push('fusion-power');
          newState.technologies[TECH_CATEGORIES.ENERGY].available = 
            newState.technologies[TECH_CATEGORIES.ENERGY].available.filter(tech => tech !== 'advanced-solar');
          
          newState.resources[RESOURCES.ENERGY].rate += 3;
          response.text = "Your scientists have made a breakthrough in solar energy technology! New highly efficient photovoltaic cells increase your energy production significantly.";
        } else {
          response.text = "Your scientists continue improving solar technology, making incremental advances.";
        }
      } else if (parsed.raw.includes('fusion') || parsed.raw.includes('nuclear')) {
        if (!newState.technologies[TECH_CATEGORIES.ENERGY].researched.includes('nuclear-fission')) {
          newState.technologies[TECH_CATEGORIES.ENERGY].researched.push('nuclear-fission');
          newState.technologies[TECH_CATEGORIES.ENERGY].available = 
            newState.technologies[TECH_CATEGORIES.ENERGY].available.filter(tech => tech !== 'nuclear-fission');
          
          newState.resources[RESOURCES.ENERGY].rate += 5;
          response.text = "Success! Your scientists have developed nuclear fission technology, greatly boosting your civilization's energy production capacity.";
        } else {
          response.text = "Your nuclear research teams continue refining the technology, making it safer and more efficient.";
        }
      } else if (parsed.raw.includes('propulsion') || parsed.raw.includes('drive') || parsed.raw.includes('rocket')) {
        if (!newState.technologies[TECH_CATEGORIES.PROPULSION].researched.includes('ion-drives')) {
          newState.technologies[TECH_CATEGORIES.PROPULSION].researched.push('ion-drives');
          newState.technologies[TECH_CATEGORIES.PROPULSION].available.push('fusion-drives');
          newState.technologies[TECH_CATEGORIES.PROPULSION].available = 
            newState.technologies[TECH_CATEGORIES.PROPULSION].available.filter(tech => tech !== 'ion-drives');
          
          response.text = "Your engineers have successfully developed ion drive technology! This efficient propulsion system will allow your spacecraft to travel further into space with less fuel.";
          response.type = "exploration";
        } else {
          response.text = "Your propulsion research teams are making progress on more advanced drive systems.";
        }
      } else {
        response.text = "Your scientists diligently pursue new knowledge, expanding your civilization's understanding of the universe.";
        newState.resources[RESOURCES.KNOWLEDGE].amount += 15;
      }
      break;
      
    case 'BUILD':
      if (parsed.raw.includes('colony') || parsed.raw.includes('settle') || parsed.raw.includes('colonize')) {
        // Find an uncolonized but discovered planet
        const targetPlanet = newState.planets.find(p => p.discovered && !p.colonized);
        
        if (targetPlanet) {
          targetPlanet.colonized = true;
          targetPlanet.population = 100;
          
          newState.resources[RESOURCES.POPULATION].amount -= 100;
          newState.resources[RESOURCES.MINERALS].amount -= 50;
          
          // Find the star system this planet belongs to
          const starSystem = newState.starSystems.find(s => s.planets.includes(targetPlanet.id));
          
          response.text = `Your colonists have successfully established a settlement on ${targetPlanet.name} in the ${starSystem.name}! The colony is small but growing, with initial infrastructure being constructed.`;
          newState.resources[RESOURCES.MINERALS].rate += 1;
          newState.resources[RESOURCES.ENERGY].rate += 1;
        } else {
          response.text = "Your colonization teams are ready, but there are no suitable discovered planets to colonize yet. Consider exploring more star systems.";
          response.type = "warning";
        }
      } else if (parsed.raw.includes('mine') || parsed.raw.includes('extractor')) {
        newState.resources[RESOURCES.MINERALS].rate += 2;
        newState.resources[RESOURCES.MINERALS].amount -= 30;
        response.text = "New mining facilities have been constructed. Your mineral extraction rate has increased.";
      } else if (parsed.raw.includes('lab') || parsed.raw.includes('research')) {
        newState.resources[RESOURCES.KNOWLEDGE].rate += 2;
        newState.resources[RESOURCES.MINERALS].amount -= 40;
        response.text = "New research laboratories have been established. Your scientists can now work more efficiently, increasing knowledge acquisition.";
      } else if (parsed.raw.includes('farm') || parsed.raw.includes('food') || parsed.raw.includes('agriculture')) {
        newState.resources[RESOURCES.POPULATION].rate += 2;
        newState.resources[RESOURCES.MINERALS].amount -= 25;
        response.text = "New agricultural facilities have been constructed. Your population growth rate has increased due to improved food production.";
      } else {
        newState.resources[RESOURCES.MINERALS].amount -= 20;
        response.text = "Construction teams have built new infrastructure to support your growing civilization.";
      }
      break;
      
    case 'RESOURCE':
      if (parsed.raw.includes('energy') || parsed.raw.includes('power')) {
        newState.resources[RESOURCES.ENERGY].rate += 1;
        response.text = "You've reallocated workers to focus on energy production. Your energy generation rate has increased.";
      } else if (parsed.raw.includes('mineral') || parsed.raw.includes('mine') || parsed.raw.includes('resource')) {
        newState.resources[RESOURCES.MINERALS].rate += 1;
        response.text = "Mining operations have been expanded. Your mineral extraction rate has increased.";
      } else if (parsed.raw.includes('research') || parsed.raw.includes('knowledge') || parsed.raw.includes('science')) {
        newState.resources[RESOURCES.KNOWLEDGE].rate += 1;
        response.text = "Additional researchers have been assigned to scientific endeavors. Your knowledge acquisition rate has increased.";
      } else if (parsed.raw.includes('population') || parsed.raw.includes('people') || parsed.raw.includes('growth')) {
        newState.resources[RESOURCES.POPULATION].rate += 1;
        response.text = "Population growth initiatives have been implemented. Your population is now growing at a faster rate.";
      } else {
        response.text = "Resource allocation adjusted according to current needs.";
      }
      break;
      
    case 'DIPLOMACY':
      response.text = "Your diplomats are ready, but there are no other civilizations to contact yet. Continue exploring and you may encounter other species.";
      response.type = "warning";
      break;
      
    default:
      response.text = "Your advisors look confused. Perhaps try exploring, researching, building, or allocating resources.";
      response.type = "warning";
  }
  
  // Update resources based on rates and time passed
  const now = Date.now();
  const hoursPassed = (now - newState.lastCommandTime) / (1000 * 60 * 60);
  const minutesPassed = (now - newState.lastCommandTime) / (1000 * 60);
  
  // Cap resource accumulation to prevent exploits from leaving the game idle
  const cappedHours = Math.min(hoursPassed, 3);
  
  // Only update if some time has passed
  if (minutesPassed > 0.5) {
    Object.keys(newState.resources).forEach(resource => {
      newState.resources[resource].amount += newState.resources[resource].rate * cappedHours;
      newState.resources[resource].amount = Math.floor(newState.resources[resource].amount);
    });
  }
  
  newState.lastCommandTime = now;
  newState.messages = [...newState.messages, response];
  
  return newState;
}

function saveGame(gameState, local = true) {
  const saveData = JSON.stringify(gameState);
  
  if (local) {
    localStorage.setItem('stellarEvolution', saveData);
    return { success: true, message: 'Game saved locally.' };
  } else {
    // Save to remote database using WebsimSocket
    try {
      // Need to trim messages to avoid too much data
      const trimmedState = {
        ...gameState,
        messages: gameState.messages.slice(-20) // Only keep the last 20 messages
      };
      
      room.collection('gameState').create({
        state: JSON.stringify(trimmedState)
      });
      
      return { success: true, message: 'Game saved to cloud.' };
    } catch (error) {
      console.error('Error saving game to cloud:', error);
      return { success: false, message: 'Failed to save game to cloud.' };
    }
  }
}

async function loadGame(local = true) {
  if (local) {
    const saveData = localStorage.getItem('stellarEvolution');
    if (saveData) {
      return { success: true, state: JSON.parse(saveData) };
    }
    return { success: false, message: 'No local save found.' };
  } else {
    // Load from remote database using WebsimSocket
    try {
      const saves = room.collection('gameState').getList();
      if (saves && saves.length > 0) {
        // Get the most recent save
        const latestSave = saves[0];
        return { success: true, state: JSON.parse(latestSave.state) };
      }
      return { success: false, message: 'No cloud saves found.' };
    } catch (error) {
      console.error('Error loading game from cloud:', error);
      return { success: false, message: 'Failed to load game from cloud.' };
    }
  }
}

// React Components
function App() {
  const [gameState, setGameState] = React.useState(() => {
    const savedState = localStorage.getItem('stellarEvolution');
    return savedState ? JSON.parse(savedState) : initialGameState;
  });
  
  const [command, setCommand] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const outputRef = React.useRef(null);
  
  // Auto-save on state change
  React.useEffect(() => {
    const saveData = JSON.stringify(gameState);
    localStorage.setItem('stellarEvolution', saveData);
  }, [gameState]);
  
  // Scroll to bottom of output when messages change
  React.useEffect(() => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  }, [gameState.messages]);
  
  // Update resources periodically if tab is active
  React.useEffect(() => {
    let intervalId;
    
    const updateResources = () => {
      setGameState(prevState => {
        const now = Date.now();
        const minutesPassed = (now - prevState.lastCommandTime) / (1000 * 60);
        
        // Only update if at least half a minute has passed
        if (minutesPassed < 0.5) return prevState;
        
        const hoursPassed = minutesPassed / 60;
        const cappedHours = Math.min(hoursPassed, 3);
        
        const newState = {...prevState, lastCommandTime: now};
        
        Object.keys(newState.resources).forEach(resource => {
          newState.resources[resource].amount += newState.resources[resource].rate * cappedHours;
          newState.resources[resource].amount = Math.floor(newState.resources[resource].amount);
        });
        
        return newState;
      });
    };
    
    // Update every minute
    intervalId = setInterval(updateResources, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!command.trim()) return;
    
    const newState = processCommand(command, gameState);
    setGameState(newState);
    setCommand('');
  };
  
  const handleSaveToCloud = async () => {
    setSaving(true);
    const result = saveGame(gameState, false);
    
    setGameState(prevState => ({
      ...prevState,
      messages: [
        ...prevState.messages, 
        { text: result.message, type: result.success ? 'development' : 'warning' }
      ]
    }));
    
    setSaving(false);
  };
  
  const handleLoadFromCloud = async () => {
    const result = await loadGame(false);
    
    if (result.success) {
      setGameState(result.state);
    } else {
      setGameState(prevState => ({
        ...prevState,
        messages: [
          ...prevState.messages, 
          { text: result.message, type: 'warning' }
        ]
      }));
    }
  };
  
  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your progress? This cannot be undone.')) {
      setGameState(initialGameState);
    }
  };
  
  return (
    <div className="app">
      <div className="status-bar">
        <div className="resource energy">
          <span>Energy: </span>
          <span className="resource-value">{Math.floor(gameState.resources.energy.amount)}</span>
          <span> (+{gameState.resources.energy.rate}/h)</span>
        </div>
        <div className="resource minerals">
          <span>Minerals: </span>
          <span className="resource-value">{Math.floor(gameState.resources.minerals.amount)}</span>
          <span> (+{gameState.resources.minerals.rate}/h)</span>
        </div>
        <div className="resource knowledge">
          <span>Knowledge: </span>
          <span className="resource-value">{Math.floor(gameState.resources.knowledge.amount)}</span>
          <span> (+{gameState.resources.knowledge.rate}/h)</span>
        </div>
        <div className="resource population">
          <span>Population: </span>
          <span className="resource-value">{Math.floor(gameState.resources.population.amount)}</span>
          <span> (+{gameState.resources.population.rate}/h)</span>
        </div>
      </div>
      
      <div className="output-container" ref={outputRef}>
        {gameState.messages.map((message, index) => (
          <div key={index} className={`message ${message.type}`}>
            {message.text}
          </div>
        ))}
      </div>
      
      <form className="command-form" onSubmit={handleSubmit}>
        <input
          type="text"
          className="command-input"
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          placeholder="Enter your command..."
          autoFocus
        />
        
        <div className="controls">
          <button 
            type="button" 
            className="control-button save-button"
            onClick={handleSaveToCloud}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save to Cloud'}
          </button>
          
          <button 
            type="button" 
            className="control-button load-button"
            onClick={handleLoadFromCloud}
          >
            Load from Cloud
          </button>
          
          <button 
            type="button" 
            className="control-button reset-button"
            onClick={handleReset}
          >
            Reset Game
          </button>
        </div>
      </form>
    </div>
  );
}

document.addEventListener('DOMContentLoaded', () => {
  const root = ReactDOM.createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
});