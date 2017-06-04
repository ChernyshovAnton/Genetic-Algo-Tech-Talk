import { drawLocations, drawRoute } from './utils';

module.exports = Individual;

function Individual (dna) {
  this.dna = dna || [];
}

// NON MUTATING
// TSP requires all chromosomes to share same unique set of routes
// therefore we have two options:
//   1. only SWAP locations to mutate, always producing valid routes
//   2. cull invalid routes post-hoc

// retry if tries to swap with self
Individual.prototype.mutate = function (pM) {
  const mutatedRoute = this.dna.slice();
  for (let index = 0; index < mutatedRoute.length; index++) {
    if (pM > Math.random()) {

      const randInd = Math.floor(Math.random() * mutatedRoute.length);
      if (randInd === index) return this.mutate(pM);

      const tempLoc = mutatedRoute[randInd];
      mutatedRoute[randInd] = mutatedRoute[index];
      mutatedRoute[index] = tempLoc;
    }
  }

  return new Individual(mutatedRoute);
};

Individual.prototype.getFitness = function () {
  return distanceFitness(this.dna);
};

Individual.prototype.draw = function (ctx) {
  drawLocations(ctx, this.dna);
  drawRoute(ctx, this.dna);
};

function distanceFitness (route) {
  let prev = route[0];
  let distance = route.reduce((totalDist, location) => {
    const distToAdd = Math.hypot(location.x - prev.x, location.y - prev.y);
    prev = location;

    return totalDist + distToAdd;
  }, 0);

  // make circular
  const first = route[0];
  const last = route[route.length - 1];
  distance += Math.hypot(first.x - last.x, first.y - last.y);

  return 1 / distance;
}
