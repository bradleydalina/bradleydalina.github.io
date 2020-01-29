(function(w, d)
{
    'use_strict';
    function _()
    {
        const terebra = {};
        terebra.data = {
            "rawdata":[],
            "filedata":[],
            "formdata": new FormData(),
            get sent(){return this.formdata;},
            "response":[],
            get received(){return this.response;}
        };
        terebra.version =
        {
            name:"Terebra Acrior",
            id:"1.0",
            description : "Centralized form validation in a single ajax request template",
            title:"Terebra JS",
            filename: "terebra.js",
            date :  "June 29, 2019 2:00pm"
        }
        terebra.author =
        {
            name:"Bradley B. Dalina",
            profession:"Senior System Engineer IV, Wordpress Fullstack Developer",
            email:"bdalina54@gmail.com",
            number:"(+63)9264482952",
            url:"https://www.bradley-dalina.tk/"
        }
        terebra.settings =
        {
            "type":"POST",
            "url": "/",
            "async": true,
            "responseType":"json",
            "withCredentials": true,
            "crossDomain":true,
            "cache": false,
            "user": null,
            "password": null,
            "contentType": "application/x-www-form-urlencoded; charset=UTF-8",//'multipart/form-data',
            "processData": true,
            "xrequestedWith":'XMLHttpRequest'
        }

        terebra.parent = null;
        terebra.child = null;
        terebra.button =null;
        terebra.ignore = 'ignore';

        terebra.run=null;
        terebra.done=null;
        terebra.fail=null;
        terebra.complete=null;


        const id = (str) =>
        {
            let invalid_id = str.match(/[^#a-z0-9-_]/gmi); // a valid id #a-zA-Z-0-9-_

            if(!invalid_id)
            {
                return document.getElementById( str.replace(/#/gm,'') );
            }
            else
            {
                return qr(str);
            }
        };
        const cl = (str) =>
        {
            let invalid_class = str.match(/[^.a-z0-9-_]/gmi); // a valid id .a-zA-Z-0-9-_

            if(str.indexOf('.') > 0 || invalid_class !==null )
            {
                return qa(str);
            }
            else
            {
                return document.getElementsByClassName( str.replace(/\./gm,'') );
            }
        };
        const qr = (str) => { return document.querySelector(str); };
        const qa = (str) => { return document.querySelectorAll(str); };
        const ta = (str) =>
        {
            let invalid_tag = str.match(/[^a-z]/gmi); // a valid tag a-zA-Z
            if(!invalid_tag)
            {
                return document.getElementsByTagName(str);
            }
            else
            {
                return qa(str);
            }
        };


        terebra.init = function init(parent=null, child=null, button=null)
        {
            if(parent===null)
            {
                this.parent = parent;
                this.child = child;
                this.button =button;
            }
            else if(Array.isArray(parent))
            {
                this.parent = parent[0];
                this.child = parent[1];
                this.button =parent[2];
            }
            else if(typeof parent == 'string')
            {
                this.parent = parent;
                this.child = child;
                this.button = button;
            }
            else if(Object.keys(parent) && typeof parent === "object")
            {
                this.parent = parent.parent;
                this.child = parent.child;
                this.button = parent.button;
            }
            else if(Object.keys(parent[0]) && typeof parent === "object" )
            {
                this.parent = parent[0].parent;
                this.child = parent[0].child;
                this.button = parent[0].button;
            }

            terebra.oninput();
            terebra.reset();
            //terebra.focus();
        }

        terebra.timeout = function timeout(ms, callback=null)
        {
            /*
            =================================================
            Timeout or delay function
            =================================================
            */
            return new Promise(function(resolve, reject)
            {
                setTimeout(function() {
                    (callback) ? callback() : '';
                }, ms);
            });
        }

        terebra.oninput = function oninput(el=null)
        {
            /*
            =================================================
            On input event reset input field border and value
            =================================================
            */
            if(el)
            {
                for(let i=0; i < qa(el).length; i++)
                {
                    qa(el)[i].oninput = function(e) { qa(el)[i].style.border=''; };
                }
                //qr(el).oninput = (e)=> { qr(el).style.border=''; };
                //qr(el).oninput = function(e) { qr(el).style.border=''; };
                //qr(el).addEventListener('input', (e)=> { qr(el).style.border=''; } );
            }
            else
            {
                if(typeof this.child =='string')
                {
                    this.oninput(this.child);
                }
                else
                {
                    if(this.child===null)
                    {
                        console.warn('No value was set for the inputs');
                        return false;
                    }
                    for(let i =0; i < this.child.length; i++)
                    {
                        this.oninput(this.child[i]);
                    }
                }
            }
        }

        terebra.focus = function focus(el=null)
        {
            /*
            =================================================
            On focus input field event
            =================================================
            */
            if(el)
            {
                let array = qa(this.parent+' '+el);

                for(let i =0; i < array.length; i++)
                {
                    if( (array[i].tagName).toLowerCase() != 'button' && (array[i].type).toLowerCase() !='submit')
                    {
                        if( array[i].value === '' || array[i].value === 0 || array[i].value === '0' )
                        {
                            array[i].focus();
                            return false;
                        }
                    }
                };
            }
            else
            {
                if(typeof this.child == 'string')
                {
                    this.focus(this.child);
                }
                else
                {
                    if(this.child===null)
                    {
                        console.warn('No value was set for the inputs');
                        return false;
                    }
                    for(let i =0; i < (this.child).length; i++)
                    {
                        this.focus(this.child[i]);
                    }
                }
            }
        };

        terebra.reset = function reset(el=null)
        {
            /*
            =================================================
            On reset form inputs field border and values
            =================================================
            */
            if(el)
            {

                let array = qa(this.parent+' '+el);
                for(let i =0; i < array.length; i++)
                {
                    if( (array[i].tagName).toLowerCase() != 'button' && (array[i].type).toLowerCase() !='submit')
                    {
                        if(array[i] !== cl(this.ignore)[0])
                        {
                            if( array[i].tagName != 'select' || array[i].type != 'checkbox' || array[i].type != 'radio' )
                            {
                                array[i].value='';
                                array[i].style.border='';
                            }
                            //console.group('Comparison');
                            //	console.log(array[i]);
                            //  console.log( cl(this.ignore)[0]);
                            //console.groupEnd();
                        }
                    }
                }
            }
            else
            {
                if(typeof this.child =='string')
                {
                    this.reset(this.child);
                }
                else
                {
                    if(this.child===null)
                    {
                        console.warn('No value was set for the inputs');
                        return false;
                    }
                    for(let i =0; i < this.child.length; i++)
                    {
                        this.reset(this.child[i]);
                    }
                }
            }
        }

        terebra.click= function click(callback)
        {
            /*
            =================================================
            Trigger on click event
            =================================================
            */
            id(this.button).onclick = function(e){ e.preventDefault(); return callback();};
        }

        terebra.submit = function submit()
        {
            /*
            =================================================
            Trigger submit form
            =================================================
            */
            id(this.parent).submit();
        }
        terebra.validEmail = function validEmail(email)
        {
            /*
            =================================================
            Email validator
            =================================================
            */
            const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            return re.test(String(email).toLowerCase());
        }

        terebra.validUrl = function validUrl(url)
        {
            /*
            =================================================
            URL validator
            =================================================
            */
            const res = new RegExp('^((ft|htt)ps?:\\/\\/)?'+ // protocol
                            '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
                            '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
                            '(\\:\\d+)?(\\/[-a-z\\d%_@.~+]*)*'+ // port and path
                            '((\\?|\\#)[:;&a-z\\d%_.~+=\\/-]*)?'+ // query string
                            '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
                            return res.test(String(url));
        }


        terebra.request = function request(run=null, done =null, fail=null, complete=null)
        {
            /*
            =================================================
            Centralized ajax request
            =================================================
            */
            run = (run!=null) ? run : this.run;
            done = (done!=null) ? done : this.done;
            fail= (fail!=null) ? fail : this.fail;
            complete =(complete!=null) ? complete : this.complete;
            // code for modern browsers and code for old IE browsers
            const xhttp = (window.XMLHttpRequest) ? new XMLHttpRequest() : new ActiveXObject("Microsoft.XMLHTTP");

            xhttp.onreadystatechange = function()
            {
                 if (this.readyState == 1)
                  {
                        console.info('The request to server connection established...');
                  }
                  if (this.readyState == 2)
                  {
                        console.info('The request received ...');
                  }
                  if (this.readyState == 3)
                  {
                      if(run)
                      {
                          return run();
                      }
                      else
                      {
                          console.info('The processing request...');
                      }
                  }

                  if (this.readyState == 4 && this.status == 200)
                  {
                      if(terebra.settings['responseType']=='json')
                      {
                          terebra.data['response'] = this.response;
                      }
                      else
                      {
                          terebra.data['response'] = this.responseText;
                      }
                      if(done)
                      {
                          return done(terebra.data['response']);
                      }
                      else
                      {
                            console.group('Server Request - Result');
                            console.info(terebra.data['response']);
                            console.info(`Success ${xhttp.status}: ${xhttp.statusText}`);
                            console.table(xhttp.getAllResponseHeaders());
                            console.groupEnd();
                            //return terebra.data['response'];
                      }
                  }
                  else if(this.readyState == 4 && this.status != 200)
                  {
                      if(fail)
                      {
                          return fail();
                      }
                      else
                      {
                          console.error(`Error ${xhttp.status}: ${xhttp.statusText}`);
                      }
                  }
                  if (this.readyState == 4)
                  {
                        if(complete)
                        {
                            return complete();
                        }
                        else
                        {
                            console.table(terebra.data);
                            console.info(`Server Complete Response ${xhttp.status}: ${xhttp.statusText}`);
                        }
                        let fd = [];
                        for(let key of terebra.data['formdata'].keys())
                        {
                            fd.push(key);
                        }
                        for(let i =0; i < fd.length; i++)
                        {
                            terebra.data['formdata'].delete(fd[i]);
                        }
                    }
            };
            xhttp.open(terebra.settings['type'], 'https://cors-anywhere.herokuapp.com/'+terebra.settings['url'], terebra.settings['async'], terebra.settings['user'], terebra.settings['password']);
            xhttp.responseType = terebra.settings['responseType'];
            xhttp.setRequestHeader("Accept", terebra.settings['responseType']);
            //xhttp.setRequestHeader("Accept", 'application/json');
            //xhttp.withCredentials = terebra.settings['withCredentials'];

            //xhttp.setRequestHeader('Content-Type', terebra.settings['contentType']);
            //xhttp.setRequestHeader("Access-Control-Allow-Origin", "*");
            //xhttp.setRequestHeader("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
            ///xhttp.setRequestHeader('Access-Control-Allow-Origin', 'http://localhost:80');
            // xhttp.setRequestHeader('crossDomain', terebra.settings['crossDomain']);
            // xhttp.setRequestHeader('X-Requested-With', terebra.settings['xrequestedWith']);

            // xhttp.setRequestHeader('Access-Control-Request-Headers', '*');
            // xhttp.setRequestHeader('Access-Control-Allow-Origin', '*');
            // xhttp.setRequestHeader('Access-Control-Allow-Headers', '*');

            //xhttp.setRequestHeader('Origin', terebra.settings['url']);
            // xhttp.setRequestHeader('Host', terebra.settings['url']);
            // xhttp.setRequestHeader('Referer', terebra.settings['url']);

            // if(terebra.settings['processData'])
            // {
                //let data = new URLSearchParams(JSON.stringify(terebra.data));
                // var form_data = new FormData();
                // for ( var key in terebra.data )
                // {
                //     console.log(key +","+ terebra.data[key]);
                //     form_data.append(key, terebra.data[key]);
                // }
                //console.log(form_data);
                ////JSON.stringify();
            // }
            xhttp.send(terebra.data['formdata']);

        }

        terebra.validate = function validate(callback=null)
        {
            /*
            =================================================
            Validate form input fields
            =================================================
            */
            let first_empty=null;
            let partial=null;
            let count=0;

            let validEmail = this.fn_validEmail;
            let validUrl = this.fn_validUrl;

            if(typeof this.child =='string')
            {
                let array = qa(this.parent+' '+this.child);
                for(let i =0; i < array.length; i++)
                {

                    //   $.(this.attributes, function()
                    //   {
                    //         if(this.specified)
                    //         {
                    //           old_attr.push({ [this.name] : this.value});
                    //         }
                    //   });

                    if( (array[i].tagName).toLowerCase() != 'button' && (array[i].type).toLowerCase() !='submit')
                    {

                        if("required" in array[i].attributes)
                        {
                            if(array[i].getAttribute("type").toLowerCase() =='number')
                            {
                                if( (array[i].value).trim() != 0 && (array[i].value).trim() != '0' && (array[i].value).trim().length > 0)
                                {
                                    array[i].style.border='';
                                }
                                else
                                {
                                    array[i].value='';
                                    array[i].style.border='solid 1px #ff0000';

                                    if(!first_empty)
                                    {
                                        first_empty = array[i];
                                    }
                                }
                            }
                            else if(array[i].getAttribute("type").toLowerCase() =='email')
                            {
                                if( validEmail( array[i].value ) )
                                {
                                    array[i].style.border='';
                                }
                                else
                                {
                                    array[i].value='';
                                    array[i].style.border='solid 1px #ff0000';

                                    if(!first_empty)
                                    {
                                        first_empty = array[i];
                                    }
                                }
                            }
                            else if(array[i].getAttribute("type").toLowerCase() =='url' )
                            {
                                if(validUrl( array[i].value ) )
                                {
                                    array[i].style.border='';
                                }
                                else
                                {
                                    array[i].value='';
                                    array[i].style.border='solid 1px #ff0000';

                                    if(!first_empty)
                                    {
                                        first_empty = array[i];
                                    }
                                }
                            }
                            else if( (array[i].value).trim() === '' || (array[i].value).trim().length === 0 )
                            {
                                    array[i].value='';
                                    array[i].style.border='solid 1px #ff0000';

                                    if(!first_empty)
                                    {
                                        first_empty = array[i];
                                    }
                            }
                            else
                            {
                                array[i].style.border='';
                            }
                        }
                        else
                        {
                            if(array[i].getAttribute("type").toLowerCase() =='email' )
                            {
                                if( (array[i].value).trim() != '' || (array[i].value).trim().length > 0  )
                                {
                                    if( validEmail( array[i].value ) )
                                    {
                                        array[i].style.border='';
                                    }
                                    else
                                    {
                                        array[i].value='';
                                        array[i].style.border='solid 1px #ff0000';

                                        if(!first_empty)
                                        {
                                            first_empty = array[i];
                                        }
                                    }
                                }
                            }
                            else if(array[i].getAttribute("type").toLowerCase() =='url' )
                            {
                                if( (array[i].value).trim() != '' || (array[i].value).trim().length > 0  )
                                {
                                    if( validUrl( array[i].value ) )
                                    {
                                        array[i].style.border='';
                                    }
                                    else
                                    {
                                        array[i].value='';
                                        array[i].style.border='solid 1px #ff0000';

                                        if(!first_empty)
                                        {
                                            first_empty = array[i];
                                        }
                                    }
                                }
                            }
                        }

                        if( array[i].tagName =='select')
                        {
                            terebra.data['rawdata'].push({'name':array[i].getAttribute('name'), 'value': array[i].value });
                            terebra.data['formdata'].append(array[i].getAttribute('name'), array[i].value );
                        }
                        else if( array[i].getAttribute('type') =='checkbox')
                        {
                            if( array[i].checked )
                            {
                                terebra.data['rawdata'].push({'name':array[i].getAttribute('name'), 'value': array[i].value });
                                terebra.data['formdata'].append(array[i].getAttribute('name'), array[i].value );
                            }
                        }
                        else if( array[i].getAttribute('type') =='radio')
                        {
                            if( array[i].checked )
                            {
                                terebra.data['rawdata'].push({'name':array[i].getAttribute('name'), 'value': array[i].value });
                                terebra.data['formdata'].append(array[i].getAttribute('name'), array[i].value );
                            }
                        }
                        else if( array[i].getAttribute('type') =='file')
                        {
                            if( document.getElementById(array[i].getAttribute('id')).files.length > 0 )
                            {
                                terebra.data['filedata'].push({'name':array[i].getAttribute('name'), 'id':array[i].getAttribute('id')});
                            }
                        }
                        else
                        {
                            terebra.data['rawdata'].push({'name': array[i].getAttribute('name'), 'value': array[i].value });
                            terebra.data['formdata'].append(array[i].getAttribute('name'), array[i].value );
                        }
                    }
                }
            }
            else
            {
                for( let i =0; i < this['child'].length; i++)
                {
                    let array = qa(this.parent+' '+this.child[i]);
                    for(let j =0; j < array.length; j++)
                    {
                        if( (array[j].tagName).toLowerCase() != 'button' && (array[j].type).toLowerCase() !='submit')
                        {
                            if("required" in array[j].attributes)
                            {
                                if(array[j].getAttribute("type").toLowerCase() =='number')
                                {
                                    if( (array[j].value).trim() != 0 && (array[j].value).trim() != '0' && (array[j].value).trim().length > 0)
                                    {
                                        array[j].style.border='';
                                    }
                                    else
                                    {
                                        array[j].style.border='solid 1px #ff0000';
                                        array[j].value='';
                                        if(!first_empty)
                                        {
                                            first_empty = array[j];
                                        }
                                    }
                                }
                                else if(array[j].getAttribute("type").toLowerCase() =='email')
                                {
                                    if( validEmail( array[j].value ) )
                                    {
                                        array[j].style.border='';
                                    }
                                    else
                                    {
                                        array[j].style.border='solid 1px #ff0000';
                                        array[j].value='';
                                        if(!first_empty)
                                        {
                                            first_empty = array[j];
                                        }
                                    }
                                }
                                else if(array[j].getAttribute("type").toLowerCase() =='url' )
                                {
                                    if(validUrl( array[j].value ) )
                                    {
                                        array[j].style.border='';
                                    }
                                    else
                                    {
                                        array[j].style.border='solid 1px #ff0000';
                                        array[j].value='';
                                        if(!first_empty)
                                        {
                                            first_empty = array[j];
                                        }
                                    }
                                }
                                else if( (array[j].value).trim() === '' || (array[j].value).trim().length === 0 )
                                {
                                    array[j].style.border='solid 1px #ff0000';
                                    array[j].value='';
                                    if(!first_empty)
                                    {
                                        first_empty = array[j];
                                    }
                                }
                                else
                                {
                                    array[j].style.border='';
                                }
                            }
                            else
                            {
                                if(array[j].getAttribute("type").toLowerCase() =='email' )
                                {
                                    if( (array[j].value).trim() != '' || (array[j].value).trim().length > 0  )
                                    {
                                        if( validEmail( array[j].value ) )
                                        {
                                            array[j].style.border='';
                                        }
                                        else
                                        {
                                            array[j].style.border='solid 1px #ff0000';
                                            array[j].value='';
                                            if(!first_empty)
                                            {
                                                first_empty = array[j];
                                            }
                                        }
                                    }
                                }
                                else if(array[j].getAttribute("type").toLowerCase() =='url' )
                                {
                                    if( (array[j].value).trim() != '' || (array[j].value).trim().length > 0  )
                                    {
                                        if( validUrl( array[j].value ) )
                                        {
                                            array[j].style.border='';
                                        }
                                        else
                                        {
                                            array[j].style.border='solid 1px #ff0000';
                                            array[j].value='';
                                            if(!first_empty)
                                            {
                                                first_empty = array[j];
                                            }
                                        }
                                    }
                                }
                            }

                            if( array[j].tagName =='select')
                            {
                                terebra.data['rawdata'].push({'name':array[j].getAttribute('name'), 'value':array[j].value });
                                terebra.data['formdata'].append(array[j].getAttribute('name'), array[j].value );
                            }
                            else if( array[j].getAttribute('type') =='checkbox')
                            {
                                if(array[j].checked)
                                {
                                    terebra.data['rawdata'].push({'name':array[j].getAttribute('name'), 'value':array[j].value });
                                    terebra.data['formdata'].append(array[j].getAttribute('name'), array[j].value );
                                }
                            }
                            else if( array[j].getAttribute('type') =='radio')
                            {
                                if(array[j].checked)
                                {
                                    terebra.data['rawdata'].push({'name':array[j].getAttribute('name'), 'value':array[j].value });
                                    terebra.data['formdata'].append(array[j].getAttribute('name'), array[j].value );
                                }
                            }
                            else if( array[j].getAttribute('type') =='file')
                            {
                                if( array[j].files.length > 0 )
                                {
                                    terebra.data['filedata'].push({'name':array[j].getAttribute('name'), 'id':array[j].getAttribute('id')});
                                }
                            }
                            else
                            {
                                terebra.data['rawdata'].push({'name':array[j].getAttribute('name'), 'value':array[j].value });
                                terebra.data['formdata'].append(array[j].getAttribute('name'), array[j].value );
                            }
                        }
                    }
                }
            }

            if(first_empty)
            {
                terebra.data['rawdata'] = [];
                for(let pair of terebra.data['formdata'].entries())
                {
                    terebra.data['formdata'].delete(pair[0]);
                }
                terebra.data['filedata'] = [];
                first_empty.focus();
                first_empty.value='';
                first_empty=null;
                return false;
            }
            else
            {
                if(callback)
                {
                    callback();
                }
                first_empty=null;

                if(terebra.data['filedata'].length > 0)
                {
                      for(let i =0; i < terebra.data['filedata'].length; i++)
                      {
                            let attachments = document.getElementById(terebra.data['filedata'][i].id).files;
                            let files = attachments;
                            // Loop through each of the selected files.
                            for (let x = 0; x < files.length; x++)
                            {
                                let file = files[x];
                                // Add the file to the request.
                                terebra.data['formdata'].append(terebra.data['filedata'][i].name, file, file.name);
                            }
                      }

                      terebra.settings['cache']=false;
                      terebra.settings['contentType']='multipart/form-data';
                      terebra.settings['processData']=false;
                      terebra.data['filedata'] =null;
                      console.warn('There is a present file for upload!');
                  }
                return terebra.data['formdata'];
            }
        }

        //return function
        return terebra;
    };

    if(typeof (terebra) === 'undefined')
    {
        w.terebra = _();
    }
    else
    {
        console.log("Library already defined.");
    }

})(window, document);
