const app = require('./app');
//Company single file
function generatesinglehtml(jj) {
  
    let htmlContent = '';
var contact=jj;
//console.log(contact);
//    for (const contact of jj) {
        var keyin = "contact.license_expiry_date";
       var authy="contact.authority";
        var vq="contact.visa_quotas";
        //var aform="contact.upload_application_form";
       // var bl="contact.upload_license";
        
        // Array of key-title pairs
const keysAndTitles = [
    { key: 'contact.upload_application_form', title: 'Application Form' },
    { key: 'contact.upload_license', title: 'Business Licesne' },
    { key: 'contact.upload_certificate_of_formation', title: 'Certificate Of Formation' },
    { key: 'contact.uplod_memorandum', title: 'Memorandum' },
    { key: 'contact.upload_immigration_card', title: 'Immigiration Card' }  
];
        let allFormattedResults = '';

// Loop through each key-title pair, format, and accumulate the results
keysAndTitles.forEach(pair => {
    const output = formatFiles(contact.customFields, pair.key, pair.title);
    allFormattedResults += output + "\n";  // Concatenate each result with a newline for separation
});
        
        vq=getValueByKey(contact.customFields, vq);
        
       
        var la=getValueByKey(contact.customFields, keyin);
        var auth= getValueByKey(contact.customFields, authy);

let allvisas=[];
 socket.emit('contact', {
            query1: `${contact.companyName}`,
            query2: V_locationId,
            query3: 10,
        });
      
        socket.once('searchResult',  (data) => {
            if (data.error) {
                console.error('Socket.IO Error:', data.error);
                res.status(500).send('An error occurred.');
            } else {
               allvisas= allvisas.push(JSON.stringify(data.contacts));
              
                console.log(allvisas);
            }
});


//console.log("Harry with push",JSON.stringify(allvisas));
  
          htmlContent += `
          <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex rounded-lg h-full dark:${darkgrid} ${gridback} dark:${gridtextdark} p-8 flex-col">
                  <div class="items-center mb-3">
                                       <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark}">${contact.companyName}  
                    </h2>  <span class="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">Expired On: ${la}</span>
                  </div>
                  <div class="flex-grow">
                      <p class="leading-relaxed text-base">Name: ${contact.fullNameLowerCase} <br> Email: ${contact.email} <br>Phone: ${contact.phone}</p>
                  
                   
                    
              </div>
          </div>
          </div>
          
          
            <div class="p-4 w-full md:w-1/2 lg:w-1/2">
              <div class="flex rounded-lg h-full dark:${darkgrid} ${gridback} dark:${gridtextdark} p-8 flex-col">
                 
                  <div class="flex-grow">
                        <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark}">Company Visa Quota
                      </h2><p class="leading-relaxed text-base mb-3">Number of Visas: <b>${vq}</b></p><a href="#" data='${allvisas}' class="mt-2 ${headingcolor}">Open Visas File</a>
                        <h2 class="mb-2 text-lg title-font font-medium  dark:${gridtextdark}">Authority:    <p class="leading-relaxed text-base">
                   ${auth}</p>
                   </h2></div>
          </div>
  </div>
          
          
          
          
     
<div class="p-4 w-full">
  <div class="p-4 rounded m-1 dark:${darkgrid} ${gridback} dark:${gridtextdark} -m-1.5 overflow-x-auto">
  <h2 class="font-extrabold ${headingcolor} text-lg title-font font-medium dark:${gridtextdark} text-center">Download Documents 
                    </h2>
                    
                    <p class="leading-relaxed text-base mb-3 text-center">You can download all of your company documents</p>
                    
    <div class="p-1.5 min-w-full inline-block align-middle">
      <div class="border rounded-xl overflow-hidden dark:border-neutral-700">
        <table class="min-w-full divide-y divide-gray-200 dark:divide-neutral-700">
          <thead class="${baicon} text-white dark:bg-neutral-700">
      <tr class="${baicon} text-white">
        <th class="border tex-white dark:border-slate-600 font-medium p-4 pl-8 pt-3 pb-3  dark:text-slate-200 text-left">Filename</th>
        <th class=" items-end tex-white text-right border dark:border-slate-600 font-medium p-4 pr-8 pt-3 pb-3  dark:text-slate-200">Downloads</th>
      </tr>
    </thead>
    <tbody class="bg-white dark:bg-slate-800">

      ${allFormattedResults}
    </tbody>
          </table>
      </div>
    </div>
  </div>
</div>
 
                  
          
         
                     
                     
                 
         
          
          
          
                     
                     
               
         
          
          `;




        
 //   }

    return htmlContent;

}

