﻿<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:mc="remove">
  <xsl:output method="html" omit-xml-declaration="yes" doctype-public="-//W3C//DTD XHTML 1.0 Transitional//EN" doctype-system="http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd"/>

  <xsl:template match="root">
    <xsl:call-template name="body"></xsl:call-template>
  </xsl:template>

  <xsl:template name="body">
    <html>
      <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>*|MC:SUBJECT|*</title>
        <style type="text/css">
          /* Client-specific Styles */
          #outlook a{padding:0;} /* Force Outlook to provide a "view in browser" button. */
          body{width:100% !important;} .ReadMsgBody{width:100%;} .ExternalClass{width:100%;} /* Force Hotmail to display emails at full width */
          body{-webkit-text-size-adjust:none;} /* Prevent Webkit platforms from changing default text sizes. */

          /* Reset Styles */
          body{margin:0; padding:0;}
          img{border:0; height:auto; line-height:100%; outline:none; text-decoration:none;}
          table td{border-collapse:collapse;}
          #backgroundTable{height:100% !important; margin:0; padding:0; width:100% !important;}

          /* Template Styles */

          /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: COMMON PAGE ELEMENTS /\/\/\/\/\/\/\/\/\/\ */

          /**
          * @tab Page
          * @section background color
          * @tip Set the background color for your email. You may want to choose one that matches your company's branding.
          * @theme page
          */
          body, #backgroundTable{
          /*@editable*/ background-color:#FAFAFA;
          }

          /**
          * @tab Page
          * @section email border
          * @tip Set the border for your email.
          */
          #templateContainer{
          /*@editable*/ border:0;
          }
          p{
          text-align:justify;
          }
          span{
          font-weight:bold;
          }
          /**
          * @tab Page
          * @section heading 1
          * @tip Set the styling for all first-level headings in your emails. These should be the largest of your headings.
          * @style heading 1
          */
          h1, .h1{
          /*@editable*/ color:#202020;
          display:block;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:40px;
          /*@editable*/ font-weight:bold;
          /*@editable*/ line-height:100%;
          margin-top:2%;
          margin-right:0;
          margin-bottom:1%;
          margin-left:0;
          /*@editable*/ text-align:left;
          }

          /**
          * @tab Page
          * @section heading 2
          * @tip Set the styling for all second-level headings in your emails.
          * @style heading 2
          */
          h2, .h2{
          /*@editable*/ color:#404040;
          display:block;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:18px;
          /*@editable*/ font-weight:bold;
          /*@editable*/ line-height:100%;
          margin-top:2%;
          margin-right:0;
          margin-bottom:1%;
          margin-left:0;
          /*@editable*/ text-align:left;
          }

          /**
          * @tab Page
          * @section heading 3
          * @tip Set the styling for all third-level headings in your emails.
          * @style heading 3
          */
          h3, .h3{
          /*@editable*/ color:#606060;
          display:block;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:16px;
          /*@editable*/ font-weight:bold;
          /*@editable*/ line-height:100%;
          margin-top:2%;
          margin-right:0;
          margin-bottom:1%;
          margin-left:0;
          /*@editable*/ text-align:left;
          }

          /**
          * @tab Page
          * @section heading 4
          * @tip Set the styling for all fourth-level headings in your emails. These should be the smallest of your headings.
          * @style heading 4
          */
          h4, .h4{
          /*@editable*/ color:#808080;
          display:block;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:14px;
          /*@editable*/ font-weight:bold;
          /*@editable*/ line-height:100%;
          margin-top:2%;
          margin-right:0;
          margin-bottom:1%;
          margin-left:0;
          /*@editable*/ text-align:left;
          }

          /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: PREHEADER /\/\/\/\/\/\/\/\/\/\ */

          /**
          * @tab Header
          * @section preheader style
          * @tip Set the background color for your email's preheader area.
          * @theme page
          */
          #templatePreheader{
          /*@editable*/ background-color:#FAFAFA;
          }

          /**
          * @tab Header
          * @section preheader text
          * @tip Set the styling for your email's preheader text. Choose a size and color that is easy to read.
          */
          .preheaderContent div{
          /*@editable*/ color:#707070;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:10px;
          /*@editable*/ line-height:100%;
          /*@editable*/ text-align:left;
          }

          /**
          * @tab Header
          * @section preheader link
          * @tip Set the styling for your email's preheader links. Choose a color that helps them stand out from your text.
          */
          .preheaderContent div a:link, .preheaderContent div a:visited, /* Yahoo! Mail Override */ .preheaderContent div a .yshortcuts /* Yahoo! Mail Override */{
          /*@editable*/ color:#336699;
          /*@editable*/ font-weight:normal;
          /*@editable*/ text-decoration:underline;
          }

          /**
          * @tab Header
          * @section social bar style
          * @tip Set the background color and border for your email's footer social bar.
          */
          #social div{
          /*@editable*/ text-align:right;
          }

          /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: HEADER /\/\/\/\/\/\/\/\/\/\ */

          /**
          * @tab Header
          * @section header style
          * @tip Set the background color and border for your email's header area.
          * @theme header
          */
          #templateHeader{
          /*@editable*/ background-color:#FFFFFF;
          /*@editable*/ border-bottom:5px solid #505050;
          }

          /**
          * @tab Header
          * @section left header text
          * @tip Set the styling for your email's header text. Choose a size and color that is easy to read.
          */
          .leftHeaderContent div{
          /*@editable*/ color:#202020;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:32px;
          /*@editable*/ font-weight:bold;
          /*@editable*/ line-height:100%;
          /*@editable*/ text-align:right;
          /*@editable*/ vertical-align:middle;
          }

          /**
          * @tab Header
          * @section right header text
          * @tip Set the styling for your email's header text. Choose a size and color that is easy to read.
          */
          .rightHeaderContent div{
          /*@editable*/ color:#202020;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:32px;
          /*@editable*/ font-weight:bold;
          /*@editable*/ line-height:100%;
          /*@editable*/ text-align:left;
          /*@editable*/ vertical-align:middle;
          }

          /**
          * @tab Header
          * @section header link
          * @tip Set the styling for your email's header links. Choose a color that helps them stand out from your text.
          */
          .leftHeaderContent div a:link, .leftHeaderContent div a:visited, .rightHeaderContent div a:link, .rightHeaderContent div a:visited{
          /*@editable*/ color:#336699;
          /*@editable*/ font-weight:normal;
          /*@editable*/ text-decoration:underline;
          }

          #headerImage{
          height:auto;
          max-width:180px !important;
          }

          /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: MAIN BODY /\/\/\/\/\/\/\/\/\/\ */

          /**
          * @tab Body
          * @section body style
          * @tip Set the background color for your email's body area.
          */
          #templateContainer, .bodyContent{
          /*@editable*/ background-color:#FDFDFD;
          }

          /**
          * @tab Body
          * @section body text
          * @tip Set the styling for your email's main content text. Choose a size and color that is easy to read.
          * @theme main
          */
          .bodyContent div{
          /*@editable*/ color:#505050;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:14px;
          /*@editable*/ line-height:150%;
          /*@editable*/ text-align:left;
          }

          /**
          * @tab Body
          * @section body link
          * @tip Set the styling for your email's main content links. Choose a color that helps them stand out from your text.
          */
          .bodyContent div a:link, .bodyContent div a:visited, /* Yahoo! Mail Override */ .bodyContent div a .yshortcuts /* Yahoo! Mail Override */{
          /*@editable*/ color:#336699;
          /*@editable*/ font-weight:normal;
          /*@editable*/ text-decoration:underline;
          }

          .bodyContent img{
          display:inline;
          height:auto;
          }

          /* /\/\/\/\/\/\/\/\/\/\ STANDARD STYLING: FOOTER /\/\/\/\/\/\/\/\/\/\ */

          /**
          * @tab Footer
          * @section footer style
          * @tip Set the background color and top border for your email's footer area.
          * @theme footer
          */
          #templateFooter{
          /*@editable*/ background-color:#FAFAFA;
          /*@editable*/ border-top:3px solid #909090;
          }

          /**
          * @tab Footer
          * @section footer text
          * @tip Set the styling for your email's footer text. Choose a size and color that is easy to read.
          * @theme footer
          */
          .footerContent div{
          /*@editable*/ color:#707070;
          /*@editable*/ font-family:Arial;
          /*@editable*/ font-size:11px;
          /*@editable*/ line-height:125%;
          /*@editable*/ text-align:left;
          }

          /**
          * @tab Footer
          * @section footer link
          * @tip Set the styling for your email's footer links. Choose a color that helps them stand out from your text.
          */
          .footerContent div a:link, .footerContent div a:visited, /* Yahoo! Mail Override */ .footerContent div a .yshortcuts /* Yahoo! Mail Override */{
          /*@editable*/ color:#336699;
          /*@editable*/ font-weight:normal;
          /*@editable*/ text-decoration:underline;
          }

          .footerContent img{
          display:inline;
          }

          /**
          * @tab Footer
          * @section social bar style
          * @tip Set the background color and border for your email's footer social bar.
          * @theme footer
          */
          #social{
          /*@editable*/ background-color:#FFFFFF;
          /*@editable*/ border:0;
          }

          /**
          * @tab Footer
          * @section social bar style
          * @tip Set the background color and border for your email's footer social bar.
          */
          #social div{
          /*@editable*/ text-align:left;
          }

          /**
          * @tab Footer
          * @section utility bar style
          * @tip Set the background color and border for your email's footer utility bar.
          * @theme footer
          */
          #utility{
          /*@editable*/ background-color:#FAFAFA;
          /*@editable*/ border-top:0;
          }

          /**
          * @tab Footer
          * @section utility bar style
          * @tip Set the background color and border for your email's footer utility bar.
          */
          #utility div{
          /*@editable*/ text-align:left;
          }

          #monkeyRewards img{
          max-width:170px !important;
          }
        </style>
      </head>
      <body leftmargin="0" marginwidth="0" topmargin="0" marginheight="0" offset="0">
        <table border="0" cellpadding="0" cellspacing="0" height="100%" width="100%" id="backgroundTable">
          <tr>
            <td align="center" valign="top">
              <table border="0" cellpadding="10" cellspacing="0" width="100%" id="templatePreheader">
                <tr>
                  <td valign="top" class="preheaderContent">
                    <table border="0" cellpadding="10" cellspacing="0" width="100%">
                      <tr>
                        <td valign="top">
                          <div mc:edit="std_preheader_content">
                            
                          </div>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <table border="0" cellpadding="0" cellspacing="0" width="100%" id="templateContainer">
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" id="templateHeader">
                      <tr>
                        <td class="headerContent">
                          <table border="0" cellpadding="10" cellspacing="0" width="100%">
                            <tr>
                              <!--<td valign="middle" width="130">
                                <img src="cid:{LOGOID}" style="" id="headerImage campaign-icon" mc:label="header_image" mc:edit="header_image" mc:allowtext="" />
                              </td>-->
                              <td class="rightHeaderContent">
                                <div mc:edit="header_content_right">
                                  Alta de Cuenta
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="10" cellspacing="0" width="100%" id="templateBody">
                      <tr>
                        <td valign="top" class="bodyContent">
                          <table border="0" cellpadding="10" cellspacing="0" width="100%">
                            <tr>
                              <td valign="top">
                                <div mc:edit="std_content00">
                                  <h2 style="text-align: center;">Bienvenido a MyDecMov</h2>
                                  <p>
                                    Te agradecemos ser participe de nuestro equipo de movilización para apoyar a los candidatos en las próximas elecciones.
                                  </p>
                                  <p>
                                    <span>
                                      Usuario: <xsl:value-of select="User"/>
                                    </span>
                                  </p>
                                  <p>
                                    <span>
                                      Contraseña: <xsl:value-of select="Pass"/>
                                    </span>
                                  </p>
                                  <p>
                                    Para ingresar al sistema haz click aquí:  <a href="https://www.mydecmov.com/" target="_blank">MyDecMov</a>.
                                  </p>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
                <tr>
                  <td align="center" valign="top">
                    <table border="0" cellpadding="0" cellspacing="0" width="100%" id="templateFooter">
                      <tr>
                        <td valign="top" class="footerContent">
                          <table border="0" cellpadding="10" cellspacing="0" width="100%">
                            <tr>
                              <td valign="top" width="350">
                                <div mc:edit="std_footer">
                                  <em>
                                    Copyright <xsl:value-of select="concat(COPY,' ')"/> <xsl:value-of select="YEAR"></xsl:value-of> MyDecMov, Todos los derechos reservados.
                                  </em>
                                  <br />
                                </div>
                              </td>
                            </tr>
                          </table>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
              <br />
            </td>
          </tr>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
