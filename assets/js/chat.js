
; (function (module) {

    module = module || {};
    module.exports = {
        init() {
            let _self = this;
            this.state = {
                chatList: [],
                socket: null
            }
            this.componentDidMount();
            this.errorMsg = '';
            $('#myModal').on('show.bs.modal', () => {
                $('#myModal').find('.modal-body').html(this.errorMsg)
            })
            const handler = {
                get(target, key, proxy) {
                    return Reflect.get(target, key, proxy)
                },
                set(target, key, value, proxy) {
                    if (typeof value == 'object') _self.sendChat(value);
                    return target
                }
            }
            this.state.chatList = new Proxy(this.state.chatList, handler)

        },
        openModal(obj) {
            obj && obj.text && (this.errorMsg = obj.text)
            $('#myModal').modal('show')
        },
        setChatList(obj, emit) {
            let _self = this;
            
            if (emit) {
                if(!obj.data) {
                    _self.openModal({text: 'say something, all right'})
                    return false;
                }
                _self.state.socket && _self.state.socket.emit('chat', obj)
            }
            _self.state.chatList.push(obj)
        },
        constructor(props, context) {
            //super(props, context);

        },
        componentDidMount() {
            let _self = this;
            try {
                var socket = io('http://www.newday.com');
                socket.on('connect', () => { _self.state.socket = socket });
                socket.on('chat', (obj) => _self.setChatList.bind(_self)(obj));
                let btn = document.getElementById('send_chat_btn');
                let ipt = document.getElementById('ipt_box');
                btn && btn.addEventListener('click', () => this.setChatList({ type: 'text',data: ipt.value }, true))
            }
            catch (e) {

                console.log(e)
            }

            //发送音频
            ; (function () {
                var a = document.getElementById('a');
                var b = document.getElementById('getMedia');
                var c = document.getElementById('c');
                //$('[role="alert"]').alert()
                navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia;

                var gRecorder = null;
                var audio = document.querySelector('audio');
                var door = false;
                a.onchange = function (e) {
                    var file = e.target.files[0];
                    var reader = new FileReader();
                    var preview = document.querySelector('img');
                    reader.addEventListener("load", function (e) {
                        _self.setChatList({ type: 'img',data: e.target.result }, true)
                    }, false);
                    if (file) {
                        reader.readAsDataURL(file);
                    }

                }
                b.onclick = function () {

                    if (!navigator.getUserMedia) {
                        alert('抱歉您的设备无法语音聊天');
                        return false;
                    }

                    SRecorder.get(function (rec) {
                        gRecorder = rec;
                    });



                    document.onkeydown = function (e) {
                        if (e.keyCode === 65) {
                            if (!door) {
                                gRecorder.start();
                                door = true;
                            }
                        }
                    };

                    document.onkeyup = function (e) {
                        if (e.keyCode === 65) {
                            if (door) {
                                var reader = new FileReader();
                                
                                reader.addEventListener("load", function (e) {
                                    _self.state.socket.emit('chat', { type: 'audio', data: e.target.result });
                                // _self.setChatList({ type: 'img',data: e.target.result }, true)
                                }, false);
                                reader.readAsDataURL(gRecorder.getBlob());
                                _self.state.socket.emit('chat', { type: 'audio', data: gRecorder.getBlob() });
                                console.log(gRecorder.getBlob())
                                var video = document.querySelector('audio');
                                //video.src = gRecorder.getBlob();
                                var url = URL.createObjectURL(gRecorder.getBlob());
                                video.src = url;
                                video.onloadedmetadata = function (e) {
                                    video.play()
                                    // Do something with the video here.
                                };
                                gRecorder.clear();
                                gRecorder.stop();
                                door = false;
                            }
                        }
                    }
                }



                var SRecorder = function (stream) {
                    config = {};
                    config.sampleBits = config.smapleBits || 8;
                    config.sampleRate = config.sampleRate || (44100 / 6);
                    var context = new AudioContext();
                    var audioInput = context.createMediaStreamSource(stream);
                    var recorder = context.createScriptProcessor(4096, 1, 1);
                    var audioData = {
                        size: 0          //录音文件长度
                        , buffer: []     //录音缓存
                        , inputSampleRate: context.sampleRate    //输入采样率
                        , inputSampleBits: 16       //输入采样数位 8, 16
                        , outputSampleRate: config.sampleRate    //输出采样率
                        , oututSampleBits: config.sampleBits       //输出采样数位 8, 16
                        , clear: function () {
                            this.buffer = [];
                            this.size = 0;
                        }
                        , input: function (data) {
                            this.buffer.push(new Float32Array(data));
                            this.size += data.length;
                        }
                        , compress: function () { //合并压缩
                            //合并
                            var data = new Float32Array(this.size);
                            var offset = 0;
                            for (var i = 0; i < this.buffer.length; i++) {
                                data.set(this.buffer[i], offset);
                                offset += this.buffer[i].length;
                            }
                            //压缩
                            var compression = parseInt(this.inputSampleRate / this.outputSampleRate);
                            var length = data.length / compression;
                            var result = new Float32Array(length);
                            var index = 0, j = 0;
                            while (index < length) {
                                result[index] = data[j];
                                j += compression;
                                index++;
                            }
                            return result;
                        }
                        , encodeWAV: function () {
                            var sampleRate = Math.min(this.inputSampleRate, this.outputSampleRate);
                            var sampleBits = Math.min(this.inputSampleBits, this.oututSampleBits);
                            var bytes = this.compress();
                            var dataLength = bytes.length * (sampleBits / 8);
                            var buffer = new ArrayBuffer(44 + dataLength);
                            var data = new DataView(buffer);

                            var channelCount = 1;//单声道
                            var offset = 0;

                            var writeString = function (str) {
                                for (var i = 0; i < str.length; i++) {
                                    data.setUint8(offset + i, str.charCodeAt(i));
                                }
                            };

                            // 资源交换文件标识符 
                            writeString('RIFF'); offset += 4;
                            // 下个地址开始到文件尾总字节数,即文件大小-8 
                            data.setUint32(offset, 36 + dataLength, true); offset += 4;
                            // WAV文件标志
                            writeString('WAVE'); offset += 4;
                            // 波形格式标志 
                            writeString('fmt '); offset += 4;
                            // 过滤字节,一般为 0x10 = 16 
                            data.setUint32(offset, 16, true); offset += 4;
                            // 格式类别 (PCM形式采样数据) 
                            data.setUint16(offset, 1, true); offset += 2;
                            // 通道数 
                            data.setUint16(offset, channelCount, true); offset += 2;
                            // 采样率,每秒样本数,表示每个通道的播放速度 
                            data.setUint32(offset, sampleRate, true); offset += 4;
                            // 波形数据传输率 (每秒平均字节数) 单声道×每秒数据位数×每样本数据位/8 
                            data.setUint32(offset, channelCount * sampleRate * (sampleBits / 8), true); offset += 4;
                            // 快数据调整数 采样一次占用字节数 单声道×每样本的数据位数/8 
                            data.setUint16(offset, channelCount * (sampleBits / 8), true); offset += 2;
                            // 每样本数据位数 
                            data.setUint16(offset, sampleBits, true); offset += 2;
                            // 数据标识符 
                            writeString('data'); offset += 4;
                            // 采样数据总数,即数据总大小-44 
                            data.setUint32(offset, dataLength, true); offset += 4;
                            // 写入采样数据 
                            if (sampleBits === 8) {
                                for (var i = 0; i < bytes.length; i++ , offset++) {
                                    var s = Math.max(-1, Math.min(1, bytes[i]));
                                    var val = s < 0 ? s * 0x8000 : s * 0x7FFF;
                                    val = parseInt(255 / (65535 / (val + 32768)));
                                    data.setInt8(offset, val, true);
                                }
                            } else {
                                for (var i = 0; i < bytes.length; i++ , offset += 2) {
                                    var s = Math.max(-1, Math.min(1, bytes[i]));
                                    data.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
                                }
                            }

                            return new Blob([data], { type: 'audio/wav' });
                        }
                    };

                    this.start = function () {
                        audioInput.connect(recorder);
                        recorder.connect(context.destination);
                    }

                    this.stop = function () {
                        recorder.disconnect();
                    }

                    this.getBlob = function () {
                        return audioData.encodeWAV();
                    }

                    this.clear = function () {
                        audioData.clear();
                    }

                    recorder.onaudioprocess = function (e) {
                        audioData.input(e.inputBuffer.getChannelData(0));
                    }
                };

                SRecorder.get = function (callback) {
                    if (callback) {
                        if (navigator.getUserMedia) {
                            navigator.getUserMedia(
                                { audio: true },
                                function (stream) {
                                    var rec = new SRecorder(stream);
                                    callback(rec);
                                }, function (e) {
                                    alert(e)
                                })
                        }
                    }
                }

                function receive(e) {
                    audio.src = window.URL.createObjectURL(e);
                }
            }())
        },

        getItemUi(obj) {
            var tpl;
            switch (obj.type) {
                case 'img':
                    tpl = `<img src="${obj.data}">`
                    break;
                case 'text':
                    tpl = `<p>${obj.data}</p>`;
                    break;
                case 'audio':
                    tpl = '<span class="audio"></span>'
                    break;
            }
            return `<li class="obj.type">${tpl}</li>`
        },
        sendChat(obj) {
            let _self = this;
            let itemUi = _self.getItemUi(obj);
            let chatBox = document.querySelector('.chat-list');
            chatBox && chatBox.insertAdjacentHTML('beforeEnd', itemUi);
        },
        render() {
            let state = this.state;

        }


    }
    module.exports.init()
}(window.module))

