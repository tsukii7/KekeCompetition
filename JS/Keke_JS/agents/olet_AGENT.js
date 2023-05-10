// BABA IS Y'ALL SOLVER - BLANK TEMPLATE
// Version 1.0
// Code by Milk


//get imports (NODEJS)
// Outline:
// initAgent() -> iterSolve(){ queue.shift() stateSet.push() queue.push() queue.sort() } ->
// MCTS_run() { root.mctsSearch() root.bestAction() } -> action

// todo: implement a timer to stop the search after a certain amount of time
// todo: stateSet 对 actionHistory 去重
// todo: 优化搜索参数及评估权重
// todo: 自适应搜索深度和迭代次数
var simjs = require('../js/simulation');					//access the game states and simulation
let possActions = ["space", "right", "up", "left", "down"];

const MCTS_ITERATIONS = 500;
const ROLLOUT_DEPTH = 2;
const AGENT_LENGTH = 20;
const DEFAULT_DISTANCE = 10;
const HUGE_NEGATIVE = -1000000.0;
const HUGE_POSITIVE = 1000000.0;
const EPISILON = 1e-6;
const MAXIMUM = 1e9;
const ALPHA = 0.01;
const GAMMA = 0.95;
const C = 2;
const TIME_OUT = 10;
// const MAX_LENGTH = 80;

let stateSet = [];
let stateSets = [];
let action2state = {};
let curIteration = 0;
let totalIters = 0;
let totalSteps = 0;
let currentNode = null;
let currentNodes = [];
let rootNode = null;
let salvagedTree = null;
let rootMap = null;
let gameState = null;

let solution = null;
let startTime = null;


function SingleTreeNode(m, a, p, w, d, tabooBias = 0) {
    this.mapRep = m;
    this.actionHistory = a;
    this.parent = p;
    this.won = w;
    this.died = d;
    this.nVisits = 0;
    this.toValue = 0;
    this.depth = 0;
    this.children = [null, null, null, null];

    this.expectimax = 0;
    this.nbGenerated = 0;
    this.tabooBias = tabooBias;
    this.nbExitsHere = 0;
    this.totalValueOnExit = 0;
    this.childrenMaxAdjEmax = 0;
    this.adjEmax = 0;


    this.nbGenerated = 0;
    this.nbExitsHere = 0;
    this.totalValueOnExit = 0.0;
    this.childrenMaxAdjEmax = 0.0;

    if (this.parent != null)
        this.depth = this.parent.depth + 1;
    else
        this.depth = 0;
}

function newState(kekeState, map) {
    simjs.clearLevel(kekeState);
    kekeState.orig_map = map;
    [kekeState.back_map, kekeState.obj_map] = simjs.splitMap(kekeState.orig_map);
    simjs.assignMapObjs(kekeState);
    simjs.interpretRules(kekeState);
}

function initAgent(init_state) {
    startTime = new Date().getTime();
    solution = null;
    curIteration = 0;
    rootNode = new SingleTreeNode(simjs.map2Str(init_state.orig_map), [], null, false, false);
    salvagedTree = null;
    rootMap = init_state['orig_map'];
    gameState = init_state;
}

// NEXT ITERATION STEP FOR SOLVING
function iterSolve(init_state) {
    if (salvagedTree === null) {
        rootNode = new SingleTreeNode(simjs.map2Str(init_state.orig_map), [], null, false, false);
    } else {
        rootNode = salvagedTree;
        stateSet.push(gameState['orig_map']);
    }

    if ((new Date().getTime() - startTime) / 1000 > TIME_OUT) {
        return rootNode.actionHistory;
    }
    // todo: add time constraints to the search

    totalIters += mctsSearch(rootNode);
    if (solution != null) {
        return solution;
    }
    totalSteps++;


    // todo: compare two ways
    salvagedTree = bestAction(rootNode);
    // currentNode = mostVisitedAction(currentNode);
    salvagedTree.parent = null;
    salvagedTree.depth = 0;
    refreshTree(rootNode);
    stateSet.push(salvagedTree.mapRep);


    // if (currentNode.died) {
    //     currentNodes[i] = new SingleTreeNode(simjs.map2Str(init_state.orig_map), [], null, false, false);
    //     stateSets[i] = []
    // } else if (currentNode.won) {
    //     return currentNode.actionHistory;
    // } else {
    //     currentNodes[i] = new SingleTreeNode(currentNode.mapRep, currentNode.actionHistory, null, currentNode.won, currentNode.died);
    // }

    // //return a sequence of actions or empty list
    return salvagedTree.actionHistory;
}


function applyActions(newActions) {
    // if (newActions in action2state) {
    //     console.log("already apply the actions")
    //     return action2state[newActions];
    // }

    //move the along the action space
    let state = {};
    newState(state, rootMap);
    let didwin = false;
    for (let a = 0; a < newActions.length; a++) {
        let res = simjs.nextMove(newActions[a], state);
        state = res['next_state'];
        didwin = res['won'];

        //everyone died
        if (state['players'].length === 0) {
            didwin = false;
            break;
        }
        if (didwin) {
            solution = newActions.slice(0, a + 1);
            return {state, didwin};
        }
    }
    // action2state.push({
    //     newActions: {state, didwin}
    // })
    return {state, didwin};
}

// RETURNS AN ASCII REPRESENTATION OF THE MAP STATE AFTER AN ACTION IS TAKEN
function getNextState(dir, parent) {


    //get the action space from the parent + new action
    let newActions = [];
    newActions.push.apply(newActions, parent.actionHistory);
    newActions.push(dir);

    //console.log("before KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map))
    let {state, didwin} = applyActions(newActions);
    if (didwin)
        return null;
    //console.log("after KEKE (" + newActions + "): \n" + simjs.doubleMap2Str(state.obj_map, state.back_map));

    return new SingleTreeNode(simjs.doubleMap2Str(state.obj_map, state.back_map), newActions, parent, didwin, (state['players'].length === 0))
}

//return distance from nearest goal for priority queue purposes
function getHeuristicScore(state) {
    // console.log("state: " + state);
    let win_d = heuristic2(state['players'], state['winnables']);
    let word_d = heuristic2(state['players'], state['words']);
    let push_d = heuristic2(state['players'], state['pushables']);
    // return (win_d + word_d + push_d) / 3;
    return 3 / (win_d + word_d + push_d);
}

// FIND AVERAGE DISTANCE OF GROUP THAT IS CLOSEST TO ANOTHER OBJECT IN A DIFFERENT GROUP
function heuristic2(g1, g2) {
    let allD = [];
    for (let g = 0; g < g1.length; g++) {
        for (let h = 0; h < g2.length; h++) {
            let d = dist(g1[g], g2[h]);
            allD.push(d);
        }
    }

    let avg = 0;
    for (let i = 0; i < allD.length; i++) {
        avg += allD[i];
    }
    if (allD.length === 0) {
        return DEFAULT_DISTANCE;
    }
    return avg / allD.length;
}

// BASIC EUCLIDEAN DISTANCE FUNCTION FROM OBJECT A TO OBJECT B
function dist(a, b) {
    return (Math.abs(b.x - a.x) + Math.abs(b.y - a.y));
}


// TODO: timer & avgTimeTaken
function mctsSearch( i) {
    let numIters = 0;
    let tempState = {};
    while (numIters < MCTS_ITERATIONS) {
        let start = new Date().getTime();
        newState(tempState, gameState);
        if ((new Date().getTime() - startTime) / 1000 > TIME_OUT) {
            return salvagedTree.actionHistory;
        }

        // selection & node expansion
        let selected = treePolicy(tempState);
        if (solution != null) {
            return numIters;
        }
        // simulation
        let delta = rollOut(selected, i);
        if (delta === MAXIMUM) {
            return numIters;
        }
        // backpropagation
        backUp(selected, delta);

        let end = new Date().getTime();
        // console.log('[' + numIters + 'th iteration in mstsSearch] Time taken: ', (end - start) / 1000 + 's');
        numIters++;
    }
    return numIters;
}
function expand(fatherNode, currentState){

}
// todo: compare with deepCopy
function treePolicy(currState) {
    let cur = rootNode;
    let localDepth = 0;
    let _tabooBias = 0;
    let i = 0;
    let stateFound = false;

    while (!cur.win && cur.depth < ROLLOUT_DEPTH) {
        // notFullyExpanded
        if (notFullyExpanded(cur)) {
            // expand
            return expand(cur, currState);
        }else {
            cur.children[action] = getNextState(possActions[action], cur);
            if (solution != null) {
                return cur;
            }
            return cur.children[action];
        // } else {
            let next = uct(cur);
            // let next = egreedy(cur);
            cur = next;
        }
    }
    return cur;
}


function notFullyExpanded(node) {
    for (let i = 0; i < possActions.length; i++) {
        if (node.children[i] == null) {
           return true;
        }
    }
    return false;
}


function normalise(val) {
    let min = -MAXIMUM;
    let max = MAXIMUM;
    return (val - min) / (max - min);
}


function noise(input, random) {
    if (input !== EPISILON) {
        return (input + EPISILON) * (1 + EPISILON * (random - 0.5));
    } else {
        return (input + EPISILON) * (1 + EPISILON * (random - 0.5));
    }
}

// UCT（Upper Confidence Bound Apply to Tree)
function uct(node) {
    let selected = null;
    let bestValue = -MAXIMUM;
    for (let childID in node.children) {
        let child = node.children[childID];
        let val = child.toValue;
        let childValue = val / (child.nVisits + EPISILON);
        childValue = normalise(childValue);

        let uctValue = childValue + C * Math.sqrt(Math.log(node.nVisits + 1) / (child.nVisits + EPISILON));
        // small sampleRandom numbers: break ties in unexpanded nodes
        uctValue = noise(uctValue, Math.random());

        if (uctValue > bestValue) {
            selected = child;
            bestValue = uctValue;
        }
    }

    if (selected == null) {
        console.log("Warning! returning null: " + bestValue + " : " + this.children);
    }
    return selected;
}

// todo: e-greedy
function eGreedy(node) {
}


function rollOut(selected, i) {
    let depth = selected.depth;
    let {state, didwin} = applyActions(selected.actionHistory);
    let rollerState = state;
    let died = false;

    let actions = [].concat(selected.actionHistory);
    while (depth < ROLLOUT_DEPTH) {
        // random move
        let action = possActions[Math.floor(Math.random() * possActions.length)];
        actions.push(action);
        let res = simjs.nextMove(action, rollerState);
        rollerState = res['next_state'];
        died = rollerState['players'].length === 0
        didwin = res['won'] && !died;

        if (didwin) {
            solution = actions;
            return MAXIMUM;
        }
        if (died) {
            break;
        }
        depth++;
    }
    let v = value(rollerState, didwin, died, depth, i);

    return value(rollerState, didwin, died, depth, i);
}


function value(rollerState, didwin, died, depth, i) {
    if (rollerState === null) {
        console.log('rollerState is null');
    }
    let delta = getHeuristicScore(rollerState);
    if (didwin) {
        delta += HUGE_POSITIVE * Math.pow(GAMMA, depth);
    }
    if (died) {
        delta += HUGE_NEGATIVE * Math.pow(GAMMA, depth);
    }
    // let map = simjs.doubleMap2Str(rollerState.obj_map, rollerState.back_map);
    // // for (let i = 0; i < AGENT_LENGTH; i++) {
    // if (stateSets[i].indexOf(map) !== -1) {
    //     // delta += HUGE_NEGATIVE * Math.pow(GAMMA, depth);
    //     console.log("already visited this state");
    // }
    // else {
    //     stateSets[i].push(map);
    // }
    // }


    delta = delta > MAXIMUM ? MAXIMUM : delta;
    delta = delta < -MAXIMUM ? -MAXIMUM : delta;
    return delta;
}

// backpropagation along the tree
function backUp(node, result) {
    let cur = node;
    while (cur != null) {
        cur.nVisits++;
        cur.toValue += result;
        // todo: cur.bounds[]
        cur = cur.parent;
    }
}

function bestAction(node) {
    let selected = null;
    let bestValue = -MAXIMUM;
    let children = node.children;

    for (let i = 0; i < children.length; i++) {
        if (children[i] !== null) {
            let childValue = children[i].toValue / (children[i].nVisits + EPISILON);
            childValue = noise(childValue, Math.random());
            if (childValue > bestValue) {
                selected = children[i];
                bestValue = childValue;
            }
        }
    }

    if (selected == null) {
        console.log("Unexpected selection! No valid child found!");
    }

    return selected;
}

function mostVisitedAction(node) {
    let selected = null;
    let bestValue = -MAXIMUM;
    let allEqual = true;
    let first = -1;

    let children = node.children;
    for (let i = 0; i < children.length; i++) {
        if (children[i] !== null) {
            if (first === -1) {
                first = children[i].nVisits;
            } else if (first !== children[i].nVisits) {
                allEqual = false;
            }

            let childValue = children[i].nVisits;
            childValue = noise(childValue, Math.random());
            if (childValue > bestValue) {
                selected = children[i];
                bestValue = childValue;
            }
        }

    }

    if (selected == null) {
        console.log("Unexpected selection! No valid child found!");
    } else if (allEqual) {
        // If all are equal, we opt to choose for the one with the best Q.
        selected = bestAction(node);
    }

    return selected;
}

// VISIBLE FUNCTION FOR OTHER JS FILES (NODEJS)
module.exports = {

    // iterative step function (returns solution as list of steps from poss_actions or empty list)
    step: function (init_state) {
        return iterSolve(init_state);
    },

    // initializing function here
    init: function (init_state) {
        return initAgent(init_state);
    },

    //returns closest solution in case of timeout
    best_sol: function () {
        return currentNodes[0].actionHistory;
    }
}

