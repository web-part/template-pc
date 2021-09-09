const Template = require('@definejs/template');
const Style = require('@definejs/style');

const Sample = require('./Template/Sample');

const tpl = Template.create(Sample);



tpl.process({
    '': function (data) {
        let header = this.fill('header', data);
        let content = this.fill('content', data);
        let footer = this.fill('footer', data);

        let style = Style.stringify(data.style);

        return {
            'id': data.id,
            'cssClass': data.cssClass || '',
            'style': style,
            'header': header,
            'content': content,
            'footer': footer,
        };
    },

    'header': function (data) {
        let title = data.title;

        if (!title) {
            return '';
        }


        return {
            'headerId': data.headerId,
            'title': title,
        };
    },

    'content': function (data) {

        return {
            'articleId': data.articleId,
            'contentId': data.contentId,
            'content': data.content,
            'noHeader': data.title ? '' : 'NoHeader',              //针对无标题时。
            'noFooter': data.buttons.length > 0 ? '' : 'NoFooter', //针对无按钮时。
        };
    },

    'footer': {
        '': function (data) {
            let buttons = data.buttons;
            let count = buttons.length;

            if (!count) {
                return '';
            }

            buttons = this.fill('button', buttons);

            return {
                'footerId': data.footerId,
                'count': count,
                'buttons': buttons,
            };

        },

        'button': function (item, index) {
            let style = Style.stringify(item.style);

            return {
                'index': index,
                'text': item.text,
                'cssClass': item.cssClass || '',
                'style': style,

            };
        },
    },

});


module.exports = tpl;
