由于项目内部使用了quill富文本编辑器，图片在不带http、https、data开始的src会自动替换成//:0


1.替换模块quill》dist》quill.js文件(0, _link.sanitize)(url, ['http', 'https', 'data']) ? url : '//:0'  为url