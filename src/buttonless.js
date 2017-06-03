var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var data1 = [{"x":116,"y":404},{"x":161,"y":617},{"x":16,"y":97},{"x":430,"y":536},{"x":601,"y":504},{"x":425,"y":461},{"x":114,"y":544},{"x":127,"y":118},{"x":163,"y":357},{"x":704,"y":104},{"x":864,"y":125},{"x":847,"y":523},{"x":742,"y":170},{"x":204,"y":601},{"x":421,"y":377},{"x":808,"y":49},{"x":860,"y":466},{"x":844,"y":294},{"x":147,"y":213},{"x":550,"y":124},{"x":238,"y":313},{"x":57,"y":572},{"x":664,"y":190},{"x":612,"y":644},{"x":456,"y":154},{"x":120,"y":477},{"x":542,"y":313},{"x":620,"y":29},{"x":245,"y":246},{"x":611,"y":578},{"x":627,"y":373},{"x":534,"y":286},{"x":577,"y":545},{"x":539,"y":340},{"x":794,"y":328},{"x":855,"y":139},{"x":700,"y":47},{"x":275,"y":593},{"x":130,"y":196},{"x":863,"y":35}];
var pC = .5;
var pM = .1;

function runAlgorithm () {
  const population = new Population(10, data1, pC, pM);

  // evolve population, pull out and draw the fittest
  function tick() {
    population.nextGen();
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    population.getFittest().draw(ctx);
  }

  setInterval(tick, 500);
}

function seedCanvas(thisctx, locations) {
  locations.forEach(location => {
    thisctx.fillRect(location.x, location.y, 5, 5);
  });
}

seedCanvas(ctx, data1);
setTimeout(runAlgorithm, 5000);
// produce new population, draw the fittest

function Population (size, seed, pC, pM) {
  this.currentPop = this.generate(size, seed);
  this.currentFitnesses = this.currentPop.map(individual => individual.getFitness());
  this.probCross = pC;
  this.probMuta = pM;
}

// all members of a population MUST HAVE SAME LOCATIONS
// thus generate a pop by shuffling a single set of locations
Population.prototype.generate = function (size, seed) {
  return Array(size).fill(null).map( () => new Individual(shuffle(seed)) );
};

// creates next generation for a population
// updates currentPop, currentFitnesses, returns modified population object
Population.prototype.nextGen = function () {
  let evolvedPop = [];
  while (evolvedPop.length < this.currentPop.length) {
    evolvedPop = [...evolvedPop, ...this.haveTwoChildren()];
  }

  if (evolvedPop.length > this.currentPop.length) evolvedPop.splice(-1, 1);
  this.currentPop = evolvedPop;
  this.currentFitnesses = evolvedPop.map(individual => individual.getFitness());

  return this;
};

// from current population, roulette select 2 parents (indivs), create 2 Individuals
// cross and mutate if probability dictates
Population.prototype.haveTwoChildren = function () {
  const mom = this.select();
  const dad = this.select();
  const possiblyCrossed = Math.random() < this.probCross
      ? this.crossover(mom, dad)
      : [mom, dad];

  const mutatedChildren = possiblyCrossed.map(individual => {
      return new Individual(individual.mutate(this.probMuta));
    });
  return mutatedChildren;
};

// uses roulette selection to give fitter chromosomes a better chance to be picked
Population.prototype.select = function () {
  const fitnessArr = this.currentFitnesses;
  const fitnessSum = fitnessArr.reduce((sum, fitness) => sum + fitness, 0);
  let roll = Math.random() * fitnessSum;

  for (let i = 0; i < this.currentPop.length; i++) {
    if (roll < fitnessArr[i]) return this.currentPop[i];
    roll -= fitnessArr[i];
  }
};

Population.prototype.crossover = function (mom, dad) {
  let segmentStart = Math.floor(mom.dna.length * Math.random());
  let segmentEnd = Math.floor(dad.dna.length * Math.random());

  if ( segmentStart > segmentEnd ) {
    const temp = segmentStart;
    segmentStart = segmentEnd;
    segmentEnd = temp;
  }

  const firstOffspring = orderedCross(segmentStart, segmentEnd, mom, dad);
  const secOffspring = orderedCross(segmentStart, segmentEnd, dad, mom);
  return [new Individual(firstOffspring), new Individual(secOffspring)];
};

// returns fittest individual
Population.prototype.getFittest = function () {
  const fittestIndex = this.currentFitnesses.reduce((fittestInd, currentScore, i, scores) => {
    if (currentScore > scores[fittestInd]) return i;
    return fittestInd;
  }, 0);

  return this.currentPop[fittestIndex];
};

// due to genome being a route, should exchange segments while maintaining order
function orderedCross (startInd, endInd, segParent, otherParent) {
  let crossedDNA = Array(otherParent.dna.length).fill(null);
  const segment = segParent.dna.slice(startInd, endInd);

  for (let index = startInd; index < endInd; index++) {
    crossedDNA[index] = segParent.dna[index];
  }

  for (let parentIndex in otherParent.dna) {
    const parentLoc = otherParent.dna[parentIndex];
    if (!segment.some(location => sameLocation(location, parentLoc))) {
      fillOnce(crossedDNA, parentLoc);
    }
  }

  return crossedDNA;
}

function sameLocation (location1, location2) {
  return location1.x === location2.x && location1.y === location2.y;
}

function fillOnce(offspring, locToInsert) {
  const insertAt = offspring.indexOf(null);
  if (insertAt === -1) {
    console.log('already filled?????');
  } else {
    offspring[insertAt] = locToInsert;
  }
}

function shuffle(array) {
    var rand, index = -1,
        length = array.length,
        result = Array(length);
    while (++index < length) {
        rand = Math.floor(Math.random() * (index + 1));
        result[index] = result[rand];
        result[rand] = array[index];
    }
    return result;
}

function Individual (dna) {
  this.dna = dna || [];
}

// NON MUTATING
// returns plain dna
Individual.prototype.mutate = function (pM) {
  const mutatedRoute = this.dna.slice();
  for (let index in mutatedRoute) {
    if (pM > Math.random()) {
      const randInd = Math.floor(Math.random() * mutatedRoute.length);
      const tempLoc = mutatedRoute[randInd];
      mutatedRoute[randInd] = mutatedRoute[index];
      mutatedRoute[index] = tempLoc;
    }
  }

  return mutatedRoute;
};

Individual.prototype.getFitness = function () {
  return distanceFitness(this.dna);
};

Individual.prototype.draw = function (ctx) {
  this.dna.forEach((point, index) => {
    if (index === 0) {
      ctx.moveTo(point.x, point.y);
    }
    else if (index === this.dna.length - 1) {
      ctx.lineTo(this.dna[0].x, this.dna[0].y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  });

  ctx.stroke();
};

function distanceFitness (route) {
  let prev = route[0];
  let distance = route.reduce((totalDist, location) => {
    const distToAdd = Math.hypot(location.x - prev.x, location.y - prev.y);
    prev = location;
    return distToAdd;
  }, 0);

  // make circular
  const first = route[0];
  const last = route[route.length - 1];
  distance += Math.hypot(first.x - last.x, first.y - last.y);

  return 1 / distance;
}
