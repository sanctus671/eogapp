import React from 'react';
import { Text, Image, View, PixelRatio, Platform, Dimensions } from 'react-native';
import axios from 'axios';
import environment from "../constants/environment";
import ImageViewer from '../components/ImageViewer';

const API_URL = environment.API_URL;




const handleApiError = (error:any) => {
  console.error('API Error:', error);
  throw error;
};


export const getGames = async () => {
  try {
    const response = await axios.get(API_URL + '/games?order_by=name&order=ASC');
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

  const fontScale = PixelRatio.getFontScale();
  const isTablet:boolean = Dimensions.get('window').width > 700;

  const gameRulesObj = JSON.parse(gameRules);

  const formattedSections = [];


  const ruleItems = gameRulesObj.children[1].children; //body



  for (let ruleItem of ruleItems){

  

      let ruleItemSections = ruleItem.children;
      let currentSection:any = {};
      let currentSubSection:any = {};
      let isAfterHeading = false;
      let hasImageInHeading = false;
      for (let ruleItemSection of ruleItemSections){

        if (!ruleItemSection.class && ruleItemSection.tag){
            ruleItemSection.class = ruleItemSection.tag;
        }
   
        if (ruleItemSection.class && ruleItemSection.class.includes("h1") /*ruleItemSection.class === "h1" */){

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

          currentSection = {title: title, content: "", contentItems:[], contentSubItems: [], fullPage:false, specialHeading:false};
          
        }
        else{
          //its a child of the current section
       
          if (["h1", "h2", /*"h3", "h4", "h5", "h6"*/].some(heading => ruleItemSection.class && ruleItemSection.class.includes(heading))){ //heading within section means full page
            //mark this section as a full page
            currentSection.fullPage = true;

            if (currentSubSection.title){

              if (currentSubSection.contentItems.length <  1){
                currentSubSection.specialHeading = true;
  
              }
  
              currentSection.contentSubItems.push(currentSubSection);
            }

         
            let subTitle = ruleItemSection.html.replace("{img}", "").replace("{span}", "").trim();

            if (subTitle.length < 1 && ruleItemSection.children){
              subTitle = ruleItemSection.children[0].html.replace("{img}", "").replace("{span}", "").trim();
            }



            currentSubSection = {title: subTitle, content: "", contentItems:[], fullPage:false, specialHeading:false};
            

          }

          //peice together content

          let content = ruleItemSection.html.trim();
          let contentNodes = [];

          let lineHeight = Platform.OS === "android"  ? {} : {lineHeight:12};
          if (isAfterHeading){
            if (currentSection.contentItems.length > 0){currentSection.contentItems.push(<Text  style={{...lineHeight}}>{'\n'}</Text>)} //do a new line for new item within the section
            if (currentSection.fullPage && currentSubSection.contentItems.length > 0){currentSubSection.contentItems.push(<Text style={{...lineHeight}}>{'\n'}</Text>)}
          }
          else{
            if (currentSection.contentItems.length > 0){currentSection.contentItems.push(<Text  style={{...lineHeight}}>{'\n\n'}</Text>)} //do a new line for new item within the section
            if (currentSection.fullPage && currentSubSection.contentItems.length > 0){currentSubSection.contentItems.push(<Text style={{...lineHeight}}>{'\n\n'}</Text>)}
          }


          isAfterHeading = false;


          /*
          //fix issue where image is first inline element and messes up line height of text
          if (ruleItemSection.children && ruleItemSection.children.length > 0 && ruleItemSection.children.length !== 1){
            let firstChild = ruleItemSection.children[0];

    
            if (firstChild.tag === "img"){


              let preImageText = " ";

      
              if (firstChild.styles && firstChild.styles.height && firstChild.styles.width && parseFloat(firstChild.styles.height) > 20){
                const numberOfLineBreaks = Math.floor(parseFloat(firstChild.styles.height) / 20);
                preImageText = "\r".repeat(numberOfLineBreaks) + " ";
              }


              currentSection.contentItems.push(<Text>{preImageText}</Text>);
              if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{preImageText}</Text>);}
              contentNodes.push(<Text>{preImageText}</Text>);
            }
          }

          */


          if (ruleItemSection.children){

        
            if ((["h3"].some(heading => ruleItemSection.class.includes(heading)))){
                currentSection.contentItems.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>);
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>)}
    
                contentNodes.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>);
    
    
              }


            for (let [index, ruleItemSectionChild] of ruleItemSection.children.entries()) {



                if (!ruleItemSectionChild.class && ruleItemSectionChild.tag){
                    ruleItemSectionChild.class = ruleItemSectionChild.tag;
                }

              if (ruleItemSectionChild.tag === "span"){
                //bold colored text

                //content = content.replace("{span}", "<Text style={{fontWeight:'bold', color:'#C0AB99'}}>" + ruleItemSectionChild.html + "</Text>");

                let spanStyles:any = {lineHeight:22};

                if (ruleItemSectionChild.class.includes("em")){
                  spanStyles = {fontStyle: 'italic'};
                }
                else if (ruleItemSectionChild.class.includes("strongcap")){
                  spanStyles = {fontWeight:'bold', textTransform:"uppercase"};
                }
                else{
                  spanStyles = {fontWeight:'bold', color:'#C0AB99'};
                }


                let preContent = content.split("{span}", 1);

                let extraStyles = getExtraStyles(ruleItemSection);

                currentSection.contentItems.push(<Text style={{lineHeight:22, ...extraStyles}}>{preContent[0]}</Text>);
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{...extraStyles}}>{preContent[0]}</Text>);}

                contentNodes.push(<Text style={{...extraStyles}}>{preContent[0]}</Text>);


                content = content.replace(preContent[0], "").replace("{span}", "");

                let innerContent = ruleItemSectionChild.html;
                
                if (ruleItemSectionChild.children){



                  for (let [childIndex, ruleItemSectionChildChild] of ruleItemSectionChild.children.entries()) {



                    if (!ruleItemSectionChildChild.class && ruleItemSectionChildChild.tag){
                        ruleItemSectionChildChild.class = ruleItemSectionChildChild.tag;
                    }



                    if (ruleItemSectionChildChild.tag === "img"){

                      let preContent = innerContent.split("{img}", 1);
                      let preContentText = preContent[0];

                      let width = 20;
                      let height = 20;
                      if (ruleItemSectionChildChild.styles && ruleItemSectionChildChild.styles.height && ruleItemSectionChildChild.styles.width){
                        width = parseFloat(ruleItemSectionChildChild.styles.width.replace("px", "")) * 2 * fontScale;
                        height = parseFloat(ruleItemSectionChildChild.styles.height.replace("px", "")) * 2 * fontScale;
                      }


                      //fix line height issue when image is first node in sub section
                      if (!preContentText && parseInt(index) === 0){
                        preContentText = " ";
                        if (height > 25){
                          const numberOfLineBreaks = Math.round(parseFloat(ruleItemSectionChildChild.styles.height) / 35);
                          preContentText = "\r".repeat(numberOfLineBreaks) + " ";
                        }
                      }


                      currentSection.contentItems.push(<Text>{preContentText}</Text>);
                      currentSection.contentItems.push(<ImageViewer imageUrl={ruleItemSectionChildChild.src} width={width} height={height} />);

                      if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{preContentText}</Text>);}
                      if (currentSection.fullPage){currentSubSection.contentItems.push(<ImageViewer imageUrl={ruleItemSectionChildChild.src}  width={width} height={height} />);}

                      contentNodes.push(<Text>{preContentText}</Text>);
                      contentNodes.push(<ImageViewer imageUrl={ruleItemSectionChildChild.src} width={width} height={height} />);

                      innerContent = innerContent.replace(preContent[0], "").replace("{img}", "");

                      hasImageInHeading = true;
                    }
                    else{
                      let preContent = innerContent.split("{" + ruleItemSectionChildChild.tag + "}", 1);

                      currentSection.contentItems.push(<Text style={{...spanStyles}}>{preContent[0]}</Text>);
                      currentSection.contentItems.push(<Text style={{...spanStyles}}>{ruleItemSectionChildChild.html}</Text>);

                      if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{...spanStyles}}>{preContent[0]}</Text>);}
                      if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{...spanStyles}}>{ruleItemSectionChildChild.html}</Text>);}


                      contentNodes.push(<Text style={{...spanStyles}}>{preContent[0]}</Text>);
                      contentNodes.push(<Text style={{...spanStyles}}>{ruleItemSectionChildChild.html}</Text>);

                      innerContent = innerContent.replace(preContent[0], "").replace("{" + ruleItemSectionChildChild.tag + "}", "");                      
                    }
                  }
                }

                contentNodes.push(<Text style={{...spanStyles}}>{innerContent}</Text>);

                currentSection.contentItems.push(<Text style={{...spanStyles}}>{innerContent}</Text>);
                if (currentSection.fullPage){ currentSubSection.contentItems.push(<Text style={{...spanStyles}}>{innerContent}</Text>); }
                  

              }
              else if (ruleItemSectionChild.tag === "img"){
                //image
                //content = content.replace("{img}", "<Image source={{uri: " + ruleItemSectionChild.src + "}} />");
                      
                let width = 20;
                let height = 20;
                if (ruleItemSectionChild.styles && ruleItemSectionChild.styles.height && ruleItemSectionChild.styles.width){
                  width = parseFloat(ruleItemSectionChild.styles.width.replace("px", "")) * 2 * fontScale;
                  height = parseFloat(ruleItemSectionChild.styles.height.replace("px", "")) * 2 * fontScale;
                }


                let preContent = content.split("{img}", 1);
                let preContentText = preContent[0];

                let extraStyles = getExtraStyles(ruleItemSection);



                content = content.replace(preContent[0], "").replace("{img}", "");

                //fix line height issue when image is first node in sub section
                if (!preContentText && parseInt(index) === 0 && content.length > 0){
                  preContentText = " ";
                  if (height > 25){
                    const numberOfLineBreaks = Math.round(parseFloat(ruleItemSectionChild.styles.height) / 25);
                    preContentText = "\r".repeat(numberOfLineBreaks) + " ";
                  }
                }



                currentSection.contentItems.push(<Text style={{...extraStyles}}>{preContentText}</Text>);
                currentSection.contentItems.push(<ImageViewer imageUrl={ruleItemSectionChild.src} width={width} height={height} />);

                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{...extraStyles}}>{preContentText}</Text>);} 
                if (currentSection.fullPage){currentSubSection.contentItems.push(<ImageViewer imageUrl={ruleItemSectionChild.src}  width={width} height={height}  />);}

                contentNodes.push(<Text style={{...extraStyles}}>{preContentText}</Text>);
                contentNodes.push(<ImageViewer imageUrl={ruleItemSectionChild.src}  width={width} height={height}  />);

                


              }
              else if (ruleItemSectionChild.tag === "br"){
                //new line
                if (Platform.OS === "ios"){
                  content = content.replace("{br}", "\r");
                }
                else{
                  content = content.replace("{br}", "\n");
                }
              }
              else{
                //just remove the tag from the main text
               // content = content.replace("{" + ruleItemSectionChild.tag + "}", "<Text>" + ruleItemSectionChild.html + "</Text>");
     
                let preContent = content.split("{" + ruleItemSectionChild.tag + "}", 1);

                currentSection.contentItems.push(<Text>{preContent[0]}</Text>);
                currentSection.contentItems.push(<Text>{ruleItemSectionChild.html}</Text>);

                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{preContent[0]}</Text>);}
                if (currentSection.fullPage){currentSubSection.contentItems.push(<Text>{ruleItemSectionChild.html}</Text>);}

                contentNodes.push(<Text>{preContent[0]}</Text>);
                contentNodes.push(<Text>{ruleItemSectionChild.html}</Text>);

                content = content.replace(preContent[0], "").replace("{" + ruleItemSectionChild.tag + "}", "");


              }
            }
          }
          //push any remaining content
          let extraStyles:any = {};
          let addSpace:boolean = false;
          let addSpaceAfter:boolean = false;
          if (["h2", "h3", "h4", "h5", "h6", "iwrap"].some(heading => ruleItemSection.class.includes(heading))){

            if (ruleItemSection.class.includes("h2")){

              extraStyles["fontWeight"] = "bold";
              extraStyles["fontSize"] = 22;
              extraStyles["lineHeight"] = 24;
              addSpaceAfter = true;
            }            
            if (ruleItemSection.class.includes("h3")){
 
              extraStyles["fontSize"] = 22;
              extraStyles["lineHeight"] = 24;
              //extraStyles["paddingTop"] = 10;
              //extraStyles["display"] = "flex";
              ///extraStyles["height"] = 34;
              addSpace = true;


            }
            else if (ruleItemSection.class.includes("h4")){
              extraStyles["fontSize"] = 18;
              extraStyles["lineHeight"] = 20;
              extraStyles["fontWeight"] = "bold";
              //extraStyles["paddingTop"] = 10;
              //extraStyles["display"] = "flex";
              //extraStyles["height"] = 30;
              //addSpace = true;
            }
            else if (ruleItemSection.class.includes("h5")){
              extraStyles["color"] = "#f16952";
              extraStyles["fontWeight"] = "bold";
            }
            else if (ruleItemSection.class.includes("h6")){
    
              extraStyles["fontWeight"] = "bold";
            }
            else if (ruleItemSection.class.includes("iwrap")){
              extraStyles["color"] = "#f16952";
              extraStyles["fontWeight"] = "bold";
              extraStyles["lineHeight"] = 20;
            }

            isAfterHeading = true;
          }


          if (ruleItemSection.class.includes("center")){
            extraStyles["textAlign"] = "center";
            extraStyles["alignItems"] = "center";
            extraStyles["justifyContent"] = "center";
          }



          if (addSpace && (!ruleItemSection.children || ruleItemSection.children.length < 1)){
            currentSection.contentItems.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>);
            if (currentSection.fullPage){currentSubSection.contentItems.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>)}

            contentNodes.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>);


          }


          currentSection.contentItems.push(<Text style={{...extraStyles}}>{content}</Text>);

          if (currentSection.fullPage){currentSubSection.contentItems.push(<Text style={{...extraStyles}}>{content}</Text>);}


          contentNodes.push(<Text style={{...extraStyles}}>{content}</Text>);

          if (addSpaceAfter && isTablet){
            currentSection.contentItems.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>);
            if (currentSection.fullPage){currentSubSection.contentItems.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>)}

            contentNodes.push(<Text  style={{lineHeight:15,color:"transparent"}}>{"\n"}</Text>);


          }


          hasImageInHeading = false;




          if (ruleItemSection.class.includes("list")){
            /*
            currentSection.contentItems.splice(-(contentNodes.length));
            currentSection.contentItems.push(  
              <Text style={{ backgroundColor:"grey"}}>
                
              {contentNodes.map((node, index) => (
                <React.Fragment key={index}>
                  {node}
                </React.Fragment>
              ))}
            </Text>)

            if (currentSection.fullPage){
              currentSubSection.contentItems.splice(-(contentNodes.length));
              currentSubSection.contentItems.push(  
              <Text style={{ backgroundColor:"grey"}}>
                
              {contentNodes.map((node, index) => (
                <React.Fragment key={index}>
                  {node}
                </React.Fragment>
              ))}
            </Text>)
            }
            */


          }



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

const getExtraStyles = (ruleItemSection:any) => {
    let extraStyles:any = {};
    if (["h2", "h3", "h4", "h5", "h6", "iwrap"].some(heading => ruleItemSection.class.includes(heading))){

        if (ruleItemSection.class.includes("h2")){

          extraStyles["fontWeight"] = "bold";
          extraStyles["fontSize"] = 22;
          extraStyles["lineHeight"] = 24;
          
        }            
        if (ruleItemSection.class.includes("h3")){

          extraStyles["fontSize"] = 22;
          extraStyles["lineHeight"] = 24;
          //extraStyles["paddingTop"] = 10;
          //extraStyles["display"] = "flex";
          ///extraStyles["height"] = 34;

        }
        else if (ruleItemSection.class.includes("h4")){
          extraStyles["fontSize"] = 18;
          extraStyles["lineHeight"] = 20;
          extraStyles["fontWeight"] = "bold";
          //extraStyles["paddingTop"] = 10;
          //extraStyles["display"] = "flex";
          //extraStyles["height"] = 30;
          //addSpace = true;
        }
        else if (ruleItemSection.class.includes("h5")){
          extraStyles["color"] = "#f16952";
          extraStyles["fontWeight"] = "bold";
        }
        else if (ruleItemSection.class.includes("h6")){

          extraStyles["fontWeight"] = "bold";
        }
        else if (ruleItemSection.class.includes("iwrap")){
          extraStyles["color"] = "#f16952";
          extraStyles["fontWeight"] = "bold";
          extraStyles["lineHeight"] = 20;
        }
      }    

      return extraStyles;
}


const capitalizeFirstLetter = (string:string) =>  {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}



