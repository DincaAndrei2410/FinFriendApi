  
var express = require('express')
var router = express.Router()
const {Builder, By, Key, until} = require('selenium-webdriver');

router.get('/:value/:advance/:nrYears', (req, res) => {
    const inputValue = req.params.value;
    const advance = req.params.advance;
    const nrYears = req.params.nrYears;
    const valueBox = inputValue - advance;
    const nrMonths = nrYears*12 + ' LUNI';
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

      const ingObj = {numeBanca: "ING Bank Romania", tipDobanda: "variabila", rataLunara, sumaTotalaDePlata, dobandaAnualaEfectiva, linkSimulator};
      responseArray.push(ingObj);

    }
    async function simulatorBt() {
      let driver = new Builder().forBrowser('chrome').build();
      driver.get('https://beta.bancatransilvania.ro/credite/creditele-imobiliare/creditul-imobiliar-ipotecar');
      await driver.executeScript("document.getElementById('suma_impr').value = " + inputValue);
      await driver.executeScript("$( '#suma_impr' ).change()");

      await driver.executeScript("$('input:radio[name=\"incasez_bt\"]').filter('[value=\"0\"]').attr('checked', true)");

      await driver.executeScript("document.getElementById('avans').value = " + advance);
      await driver.executeScript("$( '#avans' ).change()");

      await driver.executeScript("document.getElementById('durata_impr').value = " + nrYears);
      await driver.executeScript("$( '#durata_impr' ).change()");
      await driver.findElement(By.id('durata_impr')).sendKeys(Key.RETURN);

      const rez = await driver.executeScript("document.getElementsByClassName('td text-right')");
      console.log("rez", rez);
    }

    async function simulatorCec() {
      let driver = new Builder().forBrowser('chrome').build();
      driver.get('https://www.cec.ro/credit-ipotecar-imobiliar');
      console.log("valuebox", valueBox);
      console.log("nrMonths", nrMonths);
      await driver.executeScript("document.getElementById('calculator_borrowed_value').value = " + valueBox);
      await driver.executeScript("document.getElementById('calculator_repayment_time').value = '" + nrMonths + "'");
      await driver.findElement(By.id('calculator-calculate-btn')).sendKeys(Key.RETURN);
      const dobanda = await driver.executeScript("document.getElementById('calculator_repayment_time').textContent");
      console.log("dobanda", dobanda);
      
    }
    // simulatorBt();
    // simulatorCec();

    simulatorIng().then(() => {
      res.status(200).send(responseArray);
    })


})




module.exports = router;