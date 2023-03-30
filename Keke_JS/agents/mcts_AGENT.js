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

let MCTS_ITERATIONS = 7000;
let ROLLOUT_DEPTH = 200;
const DEFAULT_DISTANCE = 10;
const HUGE_NEGATIVE = -10000000.0;
const HUGE_POSITIVE = 10000000.0;
const EPISILON = 1e-6;
const MAXIMUM = 1e9;
const ALPHA = 0.05;
const C = 5;

let stateSet = [];
let curIteration = 0;
let totalIters = 0;
let totalSteps = 0;
let currentNode = null;
let rootMap = null;

let solution = null;

function SingleTreeNode(m, a, p, w, d) {
    this.mapRep = m;
    this.actionHistory = a;
    this.parent = p;
    this.won = w;
    this.died = d;
    this.nVisits = 0;
    this.toValue = 0;
    this.depth = 0;
    this.children = [null, null, null, null];

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
    MCTS_ITERATIONS = 300;
    ROLLOUT_DEPTH = 50;

    solution = null;
    curIteration = 0;
    currentNode = new SingleTreeNode(simjs.map2Str(init_state.orig_map), [], null, false, false);
    stateSet.push(currentNode.mapRep);
    rootMap = init_state['orig_map'];
}

// NEXT ITERATION STEP FOR SOLVING
function iterSolve(init_state) {
    // PERFORM ITERATIVE CALCULATIONS HERE

    // Do the search within the available time.
    // todo: add time constraints to the search
    // solution = null;
    // ROLLOUT_DEPTH *= 1+ALPHA;
    // MCTS_ITERATIONS *= 1+ALPHA;
    // console.log("MCTS_ITERATIONS: " + MCTS_ITERATIONS);
    // console.log("ROLLOUT_DEPTH: " + ROLLOUT_DEPTH);
    totalIters += mctsSearch(currentNode);
    totalSteps++;

    if (solution != null) {
        return solution;
    }

    // todo: compare two ways
    // Determine the best action to take and return it (in two ways).
    currentNode = bestAction(currentNode);
    stateSet.push(currentNode.mapRep);
    // console.log(currentNode.mapRep)
    //  currentNode = mostVisitedAction();
    if (currentNode.died) {
        // currentNode = new SingleTreeNode(simjs.map2Str(init_state.orig_map), [], null, false, false);
        initAgent(init_state);
    } else if (currentNode.won) {
        return currentNode.actionHistory;
    } else {
        currentNode = new SingleTreeNode(currentNode.mapRep, currentNode.actionHistory, null, currentNode.won, currentNode.died);
    }


    // return currentNode.actionHistory;

    // //return a sequence of actions or empty list
    return [];
}


function applyActions(newActions) {
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
function mctsSearch(root) {
    let numIters = 0;
    while (numIters < MCTS_ITERATIONS) {
        let start = new Date().getTime();

        // selection & node expansion
        let selected = treePolicy(root);
        if (solution != null) {
            return numIters;
        }
        // simulation
        let delta = rollOut(selected);
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

// todo: compare with deepCopy
function treePolicy(node) {
    let cur = node;
    while (!cur.win && cur.depth < ROLLOUT_DEPTH) {
        // notFullyExpanded
        let action = isFullyExpanded(cur)
        if (action !== -1) {
            // expand
            // let n_kk_p = {};
            // newState(n_kk_p, rootMap);
            // let n_kk_p = deepCopyObject(rootstate);
            cur.children[action] = getNextState(possActions[action], cur);
            if (solution != null) {
                return cur;
            }
            return cur.children[action];
        } else {
            let next = uct(cur);
            // let next = egreedy(cur);
            cur = next;
        }
    }
    return cur;
}


function isFullyExpanded(node) {
    let action = -1;
    for (let i = 0; i < possActions.length; i++) {
        if (node.children[i] == null) {
            if (action === -1 || Math.random() > 0.5) {
                action = i;
            }
        }
    }
    return action;
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


function rollOut(selected) {
    let depth = selected.depth;
    let {state, didwin} = applyActions(selected.actionHistory);
    let rollerState = state;
    let died = false;

    let actions = selected.actionHistory;
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

    return value(rollerState, didwin, died);
}


function value(rollerState, didwin, died) {
    if (rollerState === null) {
        console.log('rollerState is null');
    }
    let delta = getHeuristicScore(rollerState);
    if (didwin) {
        delta += HUGE_POSITIVE;
    }
    if (died) {
        delta += HUGE_NEGATIVE;
    }
    let map = simjs.doubleMap2Str(rollerState.obj_map, rollerState.back_map);
    if ( stateSet.indexOf(map) !== -1) {
        delta += HUGE_NEGATIVE;
        // console.log("already visited this state");
    }

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
        return currentNode.actionHistory;
    }
}

