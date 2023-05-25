import React from 'react';
import { Text, Image, View } from 'react-native';
import axios from 'axios';
import environment from "../constants/environment";

const API_URL = environment.API_URL;



const handleApiError = (error:any) => {
  console.error('API Error:', error);
  throw error;
};


export const getGames = async () => {
  try {
    const response = await axios.get(API_URL + '/games');
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const getGame = async (gameId:number) => {
  try {
    const response = await axios.get(API_URL + '/games/' + gameId);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
};

export const formatGameRules = (gameRules:string) => {
  const gameRulesObj = JSON.parse(gameRules);

  const formattedSections = [];


  const ruleItems = gameRulesObj.children[1].children; //body



  for (let ruleItem of ruleItems){

  

      let ruleItemSections = ruleItem.children;
      let currentSection:any = {};
      let currentSubSection:any = {};
      for (let ruleItemSection of ruleItemSections){
   
        if (ruleItemSection.class === "h1" ){

          if (currentSubSection.title){
            currentSection.contentSubItems.push(currentSubSection);
            currentSubSection = {};
          }

  
          if (currentSection.title){

            if (currentSection.contentItems.length <  1){
                currentSection.specialHeading = true;

            }

            formattedSections.push(currentSection);
          }


          let title = ruleItemSection.html.replace("{img}", "").replace("{span}", "").trim();

          currentSection = {title: capitalizeFirstLetter(title), content: "", contentItems:[], contentSubItems: [], fullPage:false, specialHeading:false};
          
        }
        else{
          //its a child of the current section
       
          if (["h1", "h2", "h3", "h4", "h5", "h6"].some(heading => ruleItemSection.class.includes(heading))){ //heading within section means full page
            //mark this section as a full page
            currentSection.fullPage = true;

            if (currentSubSection.title){

              if (currentSubSection.contentItems.length <  1){
                currentSubSection.specialHeading = true;
  
              }
  
              currentSection.contentSubItems.push(currentSubSection);
            }

            console.log(ruleItemSection.html);
            let subTitle = ruleItemSection.html.replace("{img}", "").replace("{span}", "").trim();

            if (subTitle.length < 1 && ruleItemSection.children){
              subTitle = ruleItemSection.children[0].html.replace("{img}", "").replace("{span}", "").trim();
            }



            currentSubSection = {title: capitalizeFirstLetter(subTitle), content: "", contentItems:[], fullPage:false, specialHeading:false};
            

          }

          //peice together content

          let content = ruleItemSection.html.trim();
          if (currentSection.contentItems.length > 0){currentSection.contentItems.push(<Text>{'\n\n'}</Text>)} //do a new line for new item within the section
          if (currentSection.fullPage && currentSubSection.contentItems.length > 0){currentSubSection.contentItems.push(<Text>{'\n\n'}</Text>)}
          if (ruleItemSection.children){
            for (let ruleItemSectionChild of ruleItemSection.children){
              if (ruleItemSectionChild.tag === "span"){
                //bold colored text

                //content = content.replace("{span}", "<Text style={{fontWeight:'bold', color:'#C0AB99'}}>" + ruleItemSectionChild.html + "</Text>");

                let preContent = content.split("{span}", 1);
                currentSection.contentItems.push(<Text>{preContent[0]}</Text>);
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{preContent[0]}</Text>);}
                content = content.replace(preContent[0], "").replace("{span}", "");

                let innerContent = ruleItemSectionChild.html;
                
                if (ruleItemSectionChild.children){
                  for (let ruleItemSectionChildChild of ruleItemSectionChild.children){
                    if (ruleItemSectionChildChild.tag === "img"){
                      let preContent = innerContent.split("{img}", 1);

                      currentSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{preContent[0]}</Text>);
                      currentSection.contentItems.push(<Image  style={{width:20, height:20}} resizeMode="contain" source={{uri:ruleItemSectionChildChild.src}} />);

                      if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{preContent[0]}</Text>);}
                      if (currentSection.fullPage){currentSubSection.contentItems.push(<Image  style={{width:20, height:20}} resizeMode="contain" source={{uri:ruleItemSectionChildChild.src}} />);}

                      innerContent = innerContent.replace(preContent[0], "").replace("{img}", "");
                    }
                    else{
                      let preContent = innerContent.split("{" + ruleItemSectionChildChild.tag + "}", 1);

                      currentSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{preContent[0]}</Text>);
                      currentSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{ruleItemSectionChildChild.html}</Text>);

                      if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{preContent[0]}</Text>);}
                      if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{ruleItemSectionChildChild.html}</Text>);}
                      innerContent = innerContent.replace(preContent[0], "").replace("{" + ruleItemSectionChildChild.tag + "}", "");                      
                    }
                  }
                }

                currentSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{innerContent}</Text>);
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{fontWeight:'bold', color:'#C0AB99'}}>{innerContent}</Text>);}

              }
              else if (ruleItemSectionChild.tag === "img"){
                //image
                //content = content.replace("{img}", "<Image source={{uri: " + ruleItemSectionChild.src + "}} />");

                let preContent = content.split("{img}", 1);
                currentSection.contentItems.push(<Text>{preContent[0]}</Text>);
                currentSection.contentItems.push(<Image  style={{width:20, height:20}} resizeMode="contain" source={{uri:ruleItemSectionChild.src}} />);

                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{preContent[0]}</Text>);}
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Image  style={{width:20, height:20}} resizeMode="contain" source={{uri:ruleItemSectionChild.src}} />);}

                content = content.replace(preContent[0], "").replace("{img}", "");


              }
              else if (ruleItemSectionChild.tag === "br"){
                //new line
                //content = content.replace("{br}", "<Text>\n</Text>");

                let preContent = content.split("{br}", 1);
                currentSection.contentItems.push(<Text>{preContent[0]}</Text>);
                currentSection.contentItems.push(<Text>\n</Text>);

                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{preContent[0]}</Text>);}
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>\n</Text>);}

                content = content.replace(preContent[0], "").replace("{br}", "");

              }
              else{
                //just remove the tag from the main text
                //content = content.replace("{" + ruleItemSectionChild.tag + "}", "<Text>" + ruleItemSectionChild.html + "</Text>");

                let preContent = content.split("{" + ruleItemSectionChild.tag + "}", 1);

                currentSection.contentItems.push(<Text>{preContent[0]}</Text>);
                currentSection.contentItems.push(<Text>{ruleItemSectionChild.html}</Text>);

                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{preContent[0]}</Text>);}
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{ruleItemSectionChild.html}</Text>);}

                content = content.replace(preContent[0], "").replace("{" + ruleItemSectionChild.tag + "}", "");


              }
            }
          }
          //push any remaining content
          currentSection.contentItems.push(<Text>{content}</Text>);
          
          if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{content}</Text>);}

        }
      }
    
      if (currentSubSection.title){
        currentSection.contentSubItems.push(currentSubSection);
        currentSubSection = {};
      }


      formattedSections.push(currentSection);


    

  }

  return formattedSections;


}


const capitalizeFirstLetter = (string:string) =>  {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}



