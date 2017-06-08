
module.exports = {
    init() {
        this.state = {
            chatList: [],
            socket: null
        }
        this.componentDidMount()
    },
	constructor(props, context) {  
        //super(props, context);
        
    },
	componentDidMount() {
        let _self = this;
        try {
            let Manager = require('socket.io-client');
            let socket = new Manager('http://www.newday.com');
            socket.on('connect', () => {_self.state.socket = socket});
            socket.on('chat', (obj) => _self.setChatList.bind(_self)(obj));
            let btn = document.getElementById('send_chat_btn');
            let ipt = document.getElementById('ipt_box');         
            btn.addEventListener('click', () => this.setChatList({data: ipt.value}))
         }
         catch (e) {
             
             console.log(e)
         }
	},
    setChatList(obj) {
        let _self = this;
        let chatList = _self.state.chatList;
        chatList.push(obj)
        console.log(_self.state.socket)
        _self.state.socket && _self.state.socket.emit('chat', obj)
        _self.sendChat.bind(_self)(obj);
        
    },
    getItemUi(data) {
        console.log(data)
        return `<li>${data}</li>`
    },
    sendChat(obj) {
        
        let _self = this;
        let itemUi = _self.getItemUi(obj.data);
        let chatBox = document.querySelector('.chat-list');
        chatBox.insertAdjacentHTML('afterBegin', itemUi);
    },
    render() {
        let state = this.state; 
        
    }
    

}

module.exports.init()