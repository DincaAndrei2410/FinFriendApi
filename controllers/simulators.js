  
var express = require('express')
var router = express.Router()
const {Builder, By, Key, until} = require('selenium-webdriver');

router.get('/:value/:advance/:nrYears', (req, res) => {
    const inputValue = req.params.value;
    const advance = req.params.advance;
    const nrYears = req.params.nrYears;
    const valueBox = inputValue - advance;
    const nrMonths = nrYears*12;
    let responseArray = [];

    async function simulatorIng() {
      let driver = new Builder().forBrowser('chrome').build();
      const linkSimulator = "https://ing.ro/persoane-fizice/credite/ipotecar";
      driver.get(linkSimulator);

      await driver.executeScript("document.getElementById('valoare_proprietate').value = " + inputValue);
      await driver.executeScript("document.getElementById('front_valoare_proprietate').value = " + inputValue);
      await driver.executeScript("$( '#valoare_proprietate' ).change()");
      await driver.executeScript("$( '#front_valoare_proprietate' ).change()");

      await driver.executeScript("document.getElementById('avans_mai_mare').value = " + advance);
      await driver.executeScript("document.getElementById('front_avans_mai_mare').value = " + advance);
      await driver.executeScript("$( '#avans_mai_mare' ).change()");
      await driver.executeScript("$( '#front_avans_mai_mare' ).change()");

      await driver.executeScript("document.getElementById('perioada').value = " + nrYears);
      await driver.executeScript("document.getElementById('front_perioada').value = " + nrYears);
      await driver.executeScript("$( '#perioada' ).change()");
      await driver.executeScript("$( '#front_perioada' ).change()");
      
      const rataLunara = await driver.findElement(By.id("v_rata_luna_fa")).getText() + " LEI";
      const sumaTotalaDePlata = await driver.findElement(By.id("v_total_amount")).getText() + " LEI";
      const dobandaAnualaEfectiva = await driver.findElement(By.id("v_dae")).getText() + "%";

      const ingObj = {numeBanca: "ING Bank Romania", tipDobanda: "variabila", rataLunara, sumaTotalaDePlata, dobandaAnualaEfectiva, linkSimulator, logo: "https://upload.wikimedia.org/wikipedia/commons/4/49/ING_Group_N.V._Logo.svg"};
      responseArray.push(ingObj);

    }
    async function simulatorBCR() {
      let driver = new Builder().forBrowser('chrome').build();
      const linkSimulator = "https://calculator-rate-credit.bcr.ro/";
      await driver.get(linkSimulator);
      

      await driver.executeScript("document.getElementById('MainContent_tip_credit').value='1'");
      await driver.executeScript("$( '#MainContent_tip_credit' ).change()");
      
      await driver.executeScript("document.getElementById('tip_produs').value='4'");
      await driver.executeScript("$( '#tip_produs' ).change()");

      await driver.executeScript("document.getElementById('currency').value='RON'");
      await driver.executeScript("$( '#currency' ).change()");
      await driver.executeScript("$( '#block-1' ).change()");
      
      await driver.executeScript("$( '#block-2' ).change()");
      setTimeout(async function(){ 
        await driver.executeScript("document.getElementById('block-2').style.display='block'");
        await driver.executeScript("$( '#block-2' ).change()"); 
      }, 200);

      await driver.executeScript("document.getElementById('tip_dobanda').value='Variabila'");
      await driver.executeScript("$( '#tip_dobanda' ).change()");

      await driver.executeScript("document.getElementById('val_credit').value = " + valueBox);
      await driver.executeScript("$( '#val_credit' ).change()");
      await driver.executeScript("document.getElementById('val_perioada').value = " + nrMonths);
      await driver.executeScript("$( '#val_perioada' ).focus()");
      await driver.executeScript("$( '#val_perioada' ).blur()");

      setTimeout(async function(){ 
        const rata = await (await (await driver.findElement(By.id("rata_preview"))).getText());
        var rataL = rata.substr(rata.indexOf(':')+2, rata.length-1);
        rataL = rataL.substring(0, rataL.length - 3); 
        var numb = rataL.match(/\d/g);
        numb = numb.join("");
        const suma = parseInt(numb);
        const nrLuni = parseInt(nrMonths);
        const sumaTotalaDePlata = suma * nrLuni + " LEI";
        const rataLunara = rataL + " LEI";
        const dobandaAnualaEfectiva = await (await driver.findElement(By.id("dae_preview")).getText()).slice(-5);
        ingObj = {numeBanca: "Banca Comerciala Romana", tipDobanda: "variabila", rataLunara, sumaTotalaDePlata, dobandaAnualaEfectiva, linkSimulator, logo: "https://upload.wikimedia.org/wikipedia/ro/9/90/BCR.svg"};
        responseArray.push(ingObj);
      }, 1500);
    }

    async function simulatorRaiffaisen() {
      let driver = new Builder().forBrowser('chrome').build();
      const linkSimulator = "https://calculator-rate-credit.bcr.ro/";
      await driver.get(linkSimulator);
      
      await driver.executeScript("document.getElementById('product').value='CreditulCasaTa'");
      await driver.executeScript("$( '#product' ).change()");
    }

    async function simulatorBt() {
      let driver = new Builder().forBrowser('chrome').build();
      driver.get('https://www.bancatransilvania.ro/simulator-credite/');
      try{
        await driver.executeScript("document.getElementById('tip2').click()");
        await driver.executeScript("document.getElementById('valoare_maxima').value = " + inputValue);
      }
      catch(err) {
        await driver.executeScript("document.getElementById('valoare_maxima').value = " + inputValue);
      }
     

    }

    async function simulatorCec() {
      let driver = new Builder().forBrowser('chrome').build();
      driver.get('https://www.cec.ro/credit-ipotecar-imobiliar');

      setTimeout(async function(){ 
        
      await driver.executeScript("document.getElementById('calculator_borrowed_value').value = '" + valueBox + "'");
      await driver.executeScript("document.getElementById('calc_value').value = " + valueBox);

      await driver.executeScript("document.getElementById('calculator_repayment_time').value = '" + nrMonths + " LUNI'");
      await driver.executeScript("document.getElementById('calc_range').value = " + nrMonths);
      }, 2000);

      // await driver.findElement(By.id('calculator-calculate-btn')).sendKeys(Key.RETURN);
      // const dobanda = await driver.executeScript("document.getElementById('calculator_repayment_time').textContent");
      // console.log("dobanda", dobanda);
      
    }
  
    // simulatorCec();
    // simulatorBt();
    // simulatorRaiffaisen();

    simulatorIng().then(() => {
      simulatorBCR().then(() => {
        setTimeout(function(){ 
          res.status(200).send(responseArray);
        }, 2000);
        
      })
    })

    


})




module.exports = router;