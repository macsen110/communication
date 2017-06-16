;(function () {
  let navs = document.querySelectorAll('.nav-button');
  let iframeDom = document.getElementById('iframe_container');
  let loadingDom = document.getElementById('loading_dom');
  let isIframeRegisterFun;
  [].forEach.call(navs, function (item, index) {
    let iframe = item.dataset.iframe;
    
    item.addEventListener('click', loadIframe.bind(null, iframe, index), false)
  })
  function loadIframe(file, idx) {
    [].forEach.call(navs, (item, index) => {
      if (index != idx) item.classList.remove('active');
      else item.classList.add('active')
    })
    loadingDom.classList.add('show')
    iframeDom.src ='./assets/tpl/'+ file+'.html';
    if (!isIframeRegisterFun) {
      isIframeRegisterFun = true
      iframeDom.addEventListener('load', passMessage.bind(iframeDom), location.host)
    }
  } 
  function passMessage() {
    
    this.contentWindow.parent.postMessage('ready', 'file://')
  }
  window.addEventListener('message', loadReadyFun, false)
  function loadReadyFun(event) {
    loadingDom.classList.remove('show');
  }
  loadIframe('index')
} ())