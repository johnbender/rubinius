/*
   Copyright (C) 2005,2009  Stefan Kaes
   skaes@railsexpress.de
*/

function rootNode() {
  return currentThread;
}

function hideUL(node) {
  var lis = node.childNodes
  var l = lis.length;
  for (var i=0; i < l ; i++ ) {
    hideLI(lis[i]);
  }
}

function showUL(node) {
  var lis = node.childNodes;
  var l = lis.length;
  for (var i=0; i < l ; i++ ) {
    showLI(lis[i]);
  }
}

function findUlChild(li){
  var ul = li.childNodes[2];
  while (ul && ul.nodeName != "UL") {
    ul = ul.nextSibling;
  }
  return ul;
}

function isLeafNode(li) {
  var img = li.firstChild;
  return (img.src.indexOf('empty.png') > -1);
}

function hideLI(li) {
  if (isLeafNode(li))
    return;

  var img = li.firstChild;
  img.src = 'http://asset.rubini.us/plus.png';

  var ul = findUlChild(li);
  if (ul) {
    ul.style.display = 'none';
    hideUL(ul);
  }
}

function showLI(li) {
  if (isLeafNode(li))
    return;

  var img = li.firstChild;
  img.src = 'http://asset.rubini.us/minus.png';

  var ul = findUlChild(li);
  if (ul) {
    ul.style.display = 'block';
    showUL(ul);
  }
}

function toggleLI(li) {
  var img = li.firstChild;
  if (img.src.indexOf("minus.png")>-1)
    hideLI(li);
  else {
    if (img.src.indexOf("plus.png")>-1)
      showLI(li);
  }
}

function aboveThreshold(text, threshold) {
  var match = text.match(/\d+[.,]\d+/);
  return (match && parseFloat(match[0].replace(/,/, '.'))>=threshold);
}

function setThresholdLI(li, threshold) {
  var img = li.firstChild;
  var text = img.nextSibling;
  var ul = findUlChild(li);

  var visible = aboveThreshold(text.nodeValue, threshold) ? 1 : 0;

  var count = 0;
  if (ul) {
    count = setThresholdUL(ul, threshold);
  }
  if (count>0) {
    img.src = 'http://asset.rubini.us/minus.png';
  }
  else {
    img.src = 'http://asset.rubini.us/empty.png';
  }
  if (visible) {
    li.style.display = 'block'
  }
  else {
    li.style.display = 'none'
  }
  return visible;
}

function setThresholdUL(node, threshold) {
  var lis = node.childNodes;
  var l = lis.length;

  var count = 0;
  for ( var i = 0; i < l ; i++ ) {
    count = count + setThresholdLI(lis[i], threshold);
  }

  var visible = (count > 0) ? 1 : 0;
  if (visible) {
    node.style.display = 'block';
  }
  else {
    node.style.display = 'none';
  }
  return visible;
}

function toggleChildren(img, event) {
  event.cancelBubble=true;

  if (img.src.indexOf('empty.png') > -1)
    return;

  var minus = (img.src.indexOf('minus.png') > -1);

  if (minus) {
    img.src = "http://asset.rubini.us/plus.png";
  }
  else
    img.src = "http://asset.rubini.us/minus.png";

  var li = img.parentNode;
  var ul = findUlChild(li);
  if (ul) {
    if (minus)
      ul.style.display = 'none';
    else
      ul.style.display = 'block';
  }
  if (minus)
    moveSelectionIfNecessary(li);
}

function showChildren(li) {
  var img = li.firstChild;
  if (img.src.indexOf('empty.png') > -1)
    return;
  img.src = "http://asset.rubini.us/minus.png";

  var ul = findUlChild(li);
  if (ul) {
    ul.style.display = 'block';
  }
}

function setThreshold() {
 var tv = document.getElementById("threshold").value;
 if (tv.match(/[0-9]+([.,][0-9]+)?/)) {
   var f = parseFloat(tv.replace(/,/, '.'));
   var threads = document.getElementsByName("thread");
   var l = threads.length;
   for ( var i = 0; i < l ; i++ ) {
     setThresholdUL(threads[i], f);
   }
   var p = selectedNode;
   while (p && p.style.display=='none')
     p=p.parentNode.parentNode;
   if (p && p.nodeName=="LI")
    selectNode(p);
 }
 else {
   alert("Please specify a decimal number as threshold value!");
 }
}

function collapseAll(event) {
  event.cancelBubble=true;
  var threads = document.getElementsByName("thread");
  var l = threads.length;
  for ( var i = 0; i < l ; i++ ) {
    hideUL(threads[i]);
  }
  selectNode(rootNode(), null);
}

function expandAll(event) {
  event.cancelBubble=true;
  var threads = document.getElementsByName("thread");
  var l = threads.length;
  for ( var i = 0; i < l ; i++ ) {
    showUL(threads[i]);
  }
}

function toggleHelp(node) {
  var help = document.getElementById("help");
  if (node.value == "Show Help") {
    node.value = "Hide Help";
    help.style.display = 'block';
  }
  else {
    node.value = "Show Help";
    help.style.display = 'none';
  }
}

var selectedNode = null;
var selectedColor = null;
var selectedThread = null;

function descendentOf(a,b){
  while (a!=b && b!=null)
    b=b.parentNode;
  return (a==b);
}

function moveSelectionIfNecessary(node){
  if (descendentOf(node, selectedNode))
    selectNode(node, null);
}

function selectNode(node, event) {
  if (event) {
    event.cancelBubble = true;
    thread = findThread(node);
    selectThread(thread);
  }
  if (selectedNode) {
    selectedNode.style.background = selectedColor;
  }
  selectedNode = node;
  selectedColor = node.style.background;
  selectedNode.style.background = "red";
  selectedNode.scrollIntoView();
  window.scrollBy(0,-400);
}

function moveUp(){
  var p = selectedNode.previousSibling;
  while (p && p.style.display == 'none')
    p = p.previousSibling;
  if (p && p.nodeName == "LI") {
    selectNode(p, null);
  }
}

function moveDown(){
  var p = selectedNode.nextSibling;
  while (p && p.style.display == 'none')
    p = p.nextSibling;
  if (p && p.nodeName == "LI") {
    selectNode(p, null);
  }
}

function moveLeft(){
  var p = selectedNode.parentNode.parentNode;
  if (p && p.nodeName=="LI") {
    selectNode(p, null);
  }
}

function moveRight(){
  if (!isLeafNode(selectedNode)) {
    showChildren(selectedNode);
    var ul = findUlChild(selectedNode);
    if (ul) {
      selectNode(ul.firstChild, null);
    }
  }
}

function moveForward(){
  if (isLeafNode(selectedNode)) {
    var p = selectedNode;
    while ((p.nextSibling == null || p.nextSibling.style.display=='none') && p.nodeName=="LI") {
      p = p.parentNode.parentNode;
    }
    if (p.nodeName=="LI")
      selectNode(p.nextSibling, null);
  }
  else {
    moveRight();
  }
}

function isExpandedNode(li){
  var img = li.firstChild;
  return(img.src.indexOf('minus.png')>-1);
}

function moveBackward(){
  var p = selectedNode;
  var q = p.previousSibling;
  while (q != null && q.style.display=='none')
    q = q.previousSibling;
  if (q == null) {
    p = p.parentNode.parentNode;
  } else {
    while (!isLeafNode(q) && isExpandedNode(q)) {
      q = findUlChild(q).lastChild;
      while (q.style.display=='none')
        q = q.previousSibling;
    }
    p = q;
  }
  if (p.nodeName=="LI")
    selectNode(p, null);
}

function moveHome() {
  selectNode(currentThread);
}

var currentThreadIndex = null;

function findThread(node){
  while (node && node.parentNode.nodeName!="BODY") {
    node = node.parentNode;
  }
  return node.firstChild;
}

function selectThread(node){
  var threads = document.getElementsByName("thread");
  currentThread = node;
  for (var i=0; i<threads.length; i++) {
    if (threads[i]==currentThread.parentNode)
      currentThreadIndex = i;
  }
}

function nextThread(){
  var threads = document.getElementsByName("thread");
  if (currentThreadIndex==threads.length-1)
    currentThreadIndex = 0;
  else
    currentThreadIndex += 1
  currentThread = threads[currentThreadIndex].firstChild;
  selectNode(currentThread, null);
}

function previousThread(){
  var threads = document.getElementsByName("thread");
  if (currentThreadIndex==0)
    currentThreadIndex = threads.length-1;
  else
    currentThreadIndex -= 1
  currentThread = threads[currentThreadIndex].firstChild;
  selectNode(currentThread, null);
}

function switchThread(node, event){
  event.cancelBubble = true;
  selectThread(node.nextSibling.firstChild);
  selectNode(currentThread, null);
}

function handleKeyEvent(event){
  var code = event.charCode ? event.charCode : event.keyCode;
  var str = String.fromCharCode(code);
  switch (str) {
    case "a": moveLeft();  break;
    case "s": moveDown();  break;
    case "d": moveRight(); break;
    case "w": moveUp();    break;
    case "f": moveForward(); break;
    case "b": moveBackward(); break;
    case "x": toggleChildren(selectedNode.firstChild, event); break;
    case "*": toggleLI(selectedNode); break;
    case "n": nextThread(); break;
    case "h": moveHome(); break;
    case "p": previousThread(); break;
  }
}
document.onkeypress=function(event){ handleKeyEvent(event) };

window.onload=function(){
  var images = document.getElementsByTagName("img");
  for (var i=0; i<images.length; i++) {
    var img = images[i];
    if (img.className == "toggle") {
      img.onclick = function(event){ toggleChildren(this, event); };
    }
  }
  var divs = document.getElementsByTagName("div");
  for (i=0; i<divs.length; i++) {
    var div = divs[i];
    if (div.className == "thread")
      div.onclick = function(event){ switchThread(this, event) };
  }
  var lis = document.getElementsByTagName("li");
  for (var i=0; i<lis.length; i++) {
    lis[i].onclick = function(event){ selectNode(this, event); };
  }
  var threads = document.getElementsByName("thread");
  currentThreadIndex = 0;
  currentThread = threads[0].firstChild;
  selectNode(currentThread, null);
}
