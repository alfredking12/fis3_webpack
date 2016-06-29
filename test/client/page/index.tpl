{% extends 'test:page/layout.tpl' %}

{% block content %}
     <div id="pages-container">
        {% widget "test:widget/message/message.tpl"%}
     </div>
{% endblock %}