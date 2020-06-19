import { isProperty, isNew, isGone, isEvent } from './utils';

let nextUnitOfWork = null;
let wipRoot = null;
let wipFiber = null;
let hookIndex = null;
let currentRoot = null;
let deletions = null;

function updateDom(dom, prevProps, nextProps) {
  // Remove old or changed event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(key => !(key in nextProps) || isNew(prevProps, nextProps)(key))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.removeEventListener(eventType, prevProps[name]);
    });

  // Remove old properties
  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isGone(prevProps, nextProps))
    .forEach(name => {
      if (name in dom) {
        dom[name] = '';
      } else {
        dom.removeAttribute(name);
      }
    });

  // Add new event listeners
  Object.keys(nextProps)
    .filter(isEvent)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      const eventType = name.toLowerCase().substring(2);
      dom.addEventListener(eventType, nextProps[name]);
    });

  // Add new/changed properties
  Object.keys(nextProps)
    .filter(isProperty)
    .filter(isNew(prevProps, nextProps))
    .forEach(name => {
      // property or attribute?
      if (name in dom) {
        dom[name] = nextProps[name];
      } else {
        dom.setAttribute(name, nextProps[name]);
      }
    });
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(wipRoot.child);
  currentRoot = wipRoot;
  wipRoot = null;
}

function commitWork(fiber) {
  if (!fiber) {
    return;
  }
  let domParentFiber = fiber.parent;
  // Go up the tree until you find a fiber with a real dom node.
  // (i.e. not a function component)
  while (!domParentFiber.dom) {
    domParentFiber = domParentFiber.parent;
  }
  const domParent = domParentFiber.dom;

  if (fiber.effectTag === 'PLACEMENT' && fiber.dom != null) {
    domParent.appendChild(fiber.dom);
  }
  if (fiber.effectTag === 'DELETION') {
    commitDeletion(fiber, domParent);
  }
  if (fiber.effectTag === 'UPDATE') {
    updateDom(fiber.dom, fiber.alternate.props, fiber.props);
    if (fiber.parent.dom && fiber.dom) {
      // Has the dom node's position moved? (Basically, is it keyed)
      // TODO: This is slow! We shouldn't need to look into the DOM
      // to see if its order has changed... And if the order has changed because
      // something before it has been removed, we shouldn't do anything.
      if (fiber.parent.dom?.childNodes[fiber.index] !== fiber.dom) {
        const referent = fiber.parent.dom?.childNodes[fiber.index];
        domParent.insertBefore(fiber.dom, referent);
      }
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function commitDeletion(fiber, domParent) {
  // Go down the tree until you find the base dom node to remove.
  if (fiber.dom) {
    domParent.removeChild(fiber.dom);
  } else {
    commitDeletion(fiber.child, domParent);
  }
}

function workLoop(deadline) {
  let shouldYield = false;
  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
    shouldYield = deadline.timeRemaining() < 1;
  }

  if (!nextUnitOfWork && wipRoot) {
    commitRoot();
  }

  requestIdleCallback(workLoop);
}

requestIdleCallback(workLoop);

function reconcileChildren(wipFiber, elements) {
  let index = 0;
  let nodeToTraverse = wipFiber.alternate?.child;
  let prevSibling = null;

  let keyedElements = new Map();
  let unkeyedElements = [];

  // Go through all the existing nodes, divide into
  // keyed and unkeyed.
  while (nodeToTraverse !== undefined) {
    if (nodeToTraverse.props.key) {
      keyedElements.set(nodeToTraverse.props.key, nodeToTraverse);
    } else {
      unkeyedElements.push(nodeToTraverse);
    }
    nodeToTraverse = nodeToTraverse.sibling;
  }

  // Go through children, append them to this fiber.
  while (
    index < elements.length ||
    unkeyedElements.length > 0 ||
    keyedElements.size > 0
  ) {
    const element = elements[index];
    let newFiber = null;

    let oldFiber;
    if (element.props.key !== undefined) {
      oldFiber = keyedElements.get(element.props.key);
      keyedElements.delete(element.props.key);
      element.referent = prevSibling?.dom;
    } else {
      oldFiber = unkeyedElements.shift();
    }

    // Compare oldFiber to element.
    const sameType = oldFiber && element?.type == element.type;

    if (sameType) {
      // Update the node
      newFiber = {
        type: oldFiber.type,
        props: element.props,
        dom: oldFiber.dom,
        parent: wipFiber,
        alternate: oldFiber,
        effectTag: 'UPDATE',
        index,
      };
    }
    if (element && !sameType) {
      // Add a new node
      newFiber = {
        type: element.type,
        props: element.props,
        dom: null,
        parent: wipFiber,
        alternate: null,
        effectTag: 'PLACEMENT',
      };
    }
    if (oldFiber && !sameType) {
      // delete an old node
      oldFiber.effectTag = 'DELETION';
      deletions.push(oldFiber);
    }

    if (index === 0) {
      wipFiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
    index++;
  }
}

function performUnitOfWork(fiber) {
  const isFunctionComponent = fiber.type instanceof Function;
  if (isFunctionComponent) {
    updateFunctionComponent(fiber);
  } else {
    // It's a normal node
    updateHostComponent(fiber);
  }

  // Traverse fiber tree, first look for children, then siblings,
  // then go to parent and try again for siblings.
  if (fiber.child) {
    return fiber.child;
  }
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.sibling) {
      return nextFiber.sibling;
    }
    nextFiber = nextFiber.parent;
  }
}

function updateFunctionComponent(fiber) {
  // Run the function to get its children.
  wipFiber = fiber;
  hookIndex = 0;
  wipFiber.hooks = [];
  const children = [fiber.type(fiber.props)];
  reconcileChildren(fiber, children.flat());
}

function updateHostComponent(fiber) {
  // Create actual dom node if it doesn't exist
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  reconcileChildren(fiber, fiber.props.children.flat());
}

function createDom(fiber) {
  const dom =
    fiber.type == 'TEXT_ELEMENT'
      ? document.createTextNode('')
      : document.createElement(fiber.type);

  updateDom(dom, {}, fiber.props);

  return dom;
}

function render(element, container) {
  wipRoot = {
    dom: container,
    props: {
      children: [element],
    },
    alternate: currentRoot,
  };
  deletions = [];
  nextUnitOfWork = wipRoot;
}

function createElement(type, props, ...children) {
  return {
    type,
    props: {
      ...props,
      children: children.map(child =>
        typeof child === 'object' ? child : createTextElement(child)
      ),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: text,
      children: [],
    },
  };
}

function useEffect(effect, dependencies) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const skip =
    oldHook?.dependencies &&
    dependencies?.every((dep, i) => dep === oldHook.dependencies[i]);

  let hook;
  if (skip) {
    hook = oldHook;
  } else {
    if (oldHook?.cleanup) oldHook.cleanup();
    const cleanup = effect();

    hook = {
      dependencies,
      cleanup,
    };
  }

  wipFiber.hooks.push(hook);
  hookIndex++;
}

function useState(initial) {
  const oldHook =
    wipFiber.alternate &&
    wipFiber.alternate.hooks &&
    wipFiber.alternate.hooks[hookIndex];

  const hook = {
    state:
      oldHook?.state ?? (initial instanceof Function ? initial() : initial),
    queue: [],
  };

  const actions = oldHook?.queue ?? [];
  actions.forEach(action => {
    hook.state = action instanceof Function ? action(hook.state) : action;
  });

  const setState = action => {
    hook.queue.push(action);
    wipRoot = {
      dom: currentRoot.dom,
      props: currentRoot.props,
      alternate: currentRoot,
    };
    // Throw away the current tree and rerender.
    nextUnitOfWork = wipRoot;
    deletions = [];
  };

  wipFiber.hooks.push(hook);
  hookIndex++;
  return [hook.state, setState];
}

const VDom = {
  render,
  createElement,
  useState,
  useEffect,
};

export default VDom;
