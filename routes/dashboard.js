function generateHtmlContent(contacts) {
    let htmlContent = '<div>';
    contacts.forEach(contact => {
        htmlContent += `<div><h2>${contact.contactName}</h2></div>`;
    });
    htmlContent += '</div>';
    return htmlContent;
}