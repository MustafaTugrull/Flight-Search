// Kalkış ve varış havaalanlarını içeren bir dizi (örnek veri)
const havaalanlari = [
    { kod: "IST", sehir: "İstanbul" },
    { kod: "ESB", sehir: "Ankara" },
    { kod: "ADB", sehir: "İzmir" },
    // ... Diğer havaalanları ekleyebilirsiniz.
];

// Kalkış ve varış havaalanlarını arama fonksiyonu
function searchHavaalanlari(inputId, resultListId, otherInputId) {
    const input = document.getElementById(inputId);
    const resultList = document.getElementById(resultListId);
    
    // Kullanıcının girdiği metni al
    const searchTerm = input.value.trim().toLowerCase();

    // Diğer inputtan seçilen havaalanını al
    const otherSelectedHavaalani = $("#" + otherInputId).val();

    // Havaalanlarını filtrele
    const filteredHavaalanlari = havaalanlari.filter(h => 
        (h.kod.toLowerCase().includes(searchTerm) || h.sehir.toLowerCase().includes(searchTerm)) &&
        h.kod.toLowerCase() !== otherSelectedHavaalani.toLowerCase()
    );

    // Sonuçları listele
    resultList.innerHTML = "";
    filteredHavaalanlari.forEach(h => {
        const option = document.createElement("option");
        option.value = h.kod;
        resultList.appendChild(option);
        
        // Havaalanı kodunun yanında şehir bilgisini göster
        option.text = `${h.kod} - ${h.sehir}`;
    });
}

// Kalkış ve varış havaalanı inputlarının değerleri değiştiğinde arama yap
document.getElementById("kalkis_havaalani").addEventListener("input", function() {
    searchHavaalanlari("kalkis_havaalani", "kalkis_havaalani_liste", "varis_havaalani");
});

document.getElementById("varis_havaalani").addEventListener("input", function() {
    searchHavaalanlari("varis_havaalani", "varis_havaalani_liste", "kalkis_havaalani");
});

// Datepicker'ları etkinleştir
$(document).ready(function() {
    var kalkisTarihiInput = $("#kalkis_tarihi");
    var donusTarihiInput = $("#donus_tarihi");

    $("#kalkis_tarihi, #donus_tarihi").datepicker({
        dateFormat: "yy-mm-dd",  // Tarih formatını belirle
        beforeShowDay: function(date) {
            var kalkisTarihi = new Date(kalkisTarihiInput.val());
            var bugun = new Date();

            // Günün tarihinden önceki tarihleri devre dışı bırak
            if (date < bugun) {
                return [false, ""];
            }

            // Kalkış tarihinden önceki tarihleri devre dışı bırak
            if (date < kalkisTarihi) {
                return [false, ""];
            }

            return [true, ""];
        },
        onSelect: function(selectedDate) {
            // Dönüş tarihi kontrolü
            validateDonusTarihi();
        }
    });

    // Kalkış tarihinden önceki tarihleri devre dışı bırak
    kalkisTarihiInput.on("input", function() {
        var kalkisTarihi = new Date(kalkisTarihiInput.val());
        $("#donus_tarihi").datepicker("option", "minDate", kalkisTarihi);
        validateDonusTarihi();
    });

    // Seçildiğinde tarihi sıfırla
    $("#kalkis_tarihi, #donus_tarihi").on("focus", function() {
        $(this).val("");
    });
});


function validateDonusTarihi() {
    var kalkisTarihi = new Date($("#kalkis_tarihi").val());
    var donusTarihiInput = $("#donus_tarihi");

    if (donusTarihiInput.val() !== "") {
        var donusTarihi = new Date(donusTarihiInput.val());

        if (donusTarihi < kalkisTarihi) {
            alert("Dönüş tarihi, kalkış tarihinden önce olamaz!");
            donusTarihiInput.val("");
        }
    }
}

function handleTekYonluChange() {
    var donusTarihiInput = $("#donus_tarihi");

    if ($("#tek_yonlu").prop("checked")) {
        donusTarihiInput.prop("disabled", true);
        donusTarihiInput.val(""); // Dönüş tarihini sıfırla
    } else {
        donusTarihiInput.prop("disabled", false);
        validateDonusTarihi();
    }
}

// Uçuşları sıralama fonksiyonu
function siralaUcuslari(flights, siralamaSecenegi) {
    switch (siralamaSecenegi) {
        case "kalkisSaatineGore":
            return flights.sort((a, b) => {
                const [aHour, aMinute] = a.departureDate.split(":").map(Number);
                const [bHour, bMinute] = b.departureDate.split(":").map(Number);
                return (aHour * 60 + aMinute) - (bHour * 60 + bMinute);
            });
        case "inisSaatineGore":
            return flights.sort((a, b) => {
                const [aHour, aMinute] = a.returnDate.split(":").map(Number);
                const [bHour, bMinute] = b.returnDate.split(":").map(Number);
                return (aHour * 60 + aMinute) - (bHour * 60 + bMinute);
            });
        case "ucusUzunlugunaGore":
            return flights.sort((a, b) => {
                const [aHour, aMinute] = a.returnDate.split(":").map(Number);
                const [bHour, bMinute] = b.departureDate.split(":").map(Number);
                const aTotalMinutes = aHour * 60 + aMinute;
                const bTotalMinutes = bHour * 60 + bMinute;
                return aTotalMinutes - bTotalMinutes;
            });
        case "fiyataGore":
            return flights.sort((a, b) => a.price - b.price);
        default:
            console.error("Geçersiz sıralama seçeneği: " + siralamaSecenegi);
            return flights;
    }
}

// Uçuşları sıralama seçeneği değiştiğinde çağrılacak fonksiyon
function handleSiralamaChange() {
    const siralamaSecenegi = $("#siralaUcuslari").val();
    const kalkisHavaalani = $("#kalkis_havaalani").val();
    const varisHavaalani = $("#varis_havaalani").val();

    // Kalkış ve varış havaalanlarına göre filtrele
    $.ajax({
        url: 'http://localhost:3000/api/flights',
        method: 'GET',
        success: function (data) {
            const filteredFlights = data.filter(flight =>
                flight.departure === kalkisHavaalani && flight.arrival === varisHavaalani
            );

            // Sıralama fonksiyonunu kullanarak uçuşları sırala
            const sortedFlights = siralaUcuslari(filteredFlights, siralamaSecenegi);

            // Uçuşları işle ve ekrana yazdır
            handleFlightResults(sortedFlights);
        },
        error: function (error) {
            console.error('API isteği başarısız:', error);
        }
    });
}

function ara() {
    // Kalkış ve varış havaalanlarını al
    var kalkisHavaalani = $("#kalkis_havaalani").val();
    var varisHavaalani = $("#varis_havaalani").val();

    if (!kalkisHavaalani || !varisHavaalani) {
        alert("Lütfen kalkış ve varış havaalanlarını seçin.");
        return false;
    }

    // Kalkış ve varış havaalanları aynı olamaz
    if (kalkisHavaalani === varisHavaalani) {
        alert("Kalkış havaalanı ile varış havaalanı aynı olamaz.");
        $("#kalkis_havaalani, #varis_havaalani").val("");
        return false;
    }

    // Kalkış tarihini kontrol et
    var kalkisTarihi = $("#kalkis_tarihi").val();
    if (!kalkisTarihi) {
        alert("Lütfen kalkış tarihini seçin.");
        return false;
    }

    // Dönüş tarihini kontrol et (sadece tek yönlü uçuş değilse)
    var tekYonluChecked = $("#tek_yonlu").prop("checked");
    var donusTarihi = $("#donus_tarihi").val();

    if (!tekYonluChecked && !donusTarihi) {
        alert("Lütfen dönüş tarihini seçin.");
        return false;
    }

    // Dönüş tarihi kalkış tarihinden önce olamaz
    if (!tekYonluChecked) {
        var kalkisDate = new Date(kalkisTarihi);
        var donusDate = new Date(donusTarihi);

        if (donusDate < kalkisDate) {
            alert("Dönüş tarihi, kalkış tarihinden önce olamaz!");
            $("#donus_tarihi").val("");
            return false;
        }
    }
    
    // API'den uçuşları getir
    $.ajax({
        url: 'http://localhost:3000/api/flights',
        method: 'GET',
        success: function (data) {
            // Kalkış ve varış havaalanlarına göre filtrele
            const filteredFlights = data.filter(flight =>
                flight.departure === kalkisHavaalani && flight.arrival === varisHavaalani
            );

            // Uçuşları işle ve ekrana yazdır
            handleFlightResults(filteredFlights);
            $("#sort").show();
        },
        error: function (error) {
            console.error('API isteği başarısız:', error);
            // Yükleniyor animasyonunu gizle (hata durumunda da gizlenmeli)
            $("#loading").show();
            $("#sort").hide();
        }
    });
}

function handleFlightResults(flights) {
    // Uçuş sonuçlarını ekrana yazdır
    const sonuclarDiv = document.getElementById('sonuclar');
    sonuclarDiv.innerHTML = '';

    if (flights.length === 0) {
        sonuclarDiv.innerHTML = '<p>Uygun uçuş bulunamadı.</p>';
    } else {
        flights.forEach(flight => {
            const flightDiv = document.createElement('div');
            flightDiv.innerHTML = `
                <p>Uçuş ID: ${flight.id}</p>
                <p>Firma: ${flight.company}</p>
                <p>Kalkış Havaalanı: ${flight.departure} - ${getCityName(flight.departure)}</p>
                <p>Varış Havaalanı: ${flight.arrival} - ${getCityName(flight.arrival)}</p>
                <p>Kalkış Saati: ${flight.departureDate}</p>
                <p>İniş Saati: ${flight.returnDate}</p>
                <p>Fiyat: ${flight.price} TL</p>
                <button type="button">Bilet Al</button>
                <hr>
            `;
            sonuclarDiv.appendChild(flightDiv);
        });
    }
}

// Havaalanı kodundan şehir adını bulmak için
function getCityName(airportCode) {
    const airport = havaalanlari.find(h => h.kod === airportCode);
    return airport ? airport.sehir : '';
}

// Sayfa yüklendiğinde çağrılmayacak, sadece "Ara" butonuna tıklandığında çağrılacak
$("#araButton").click(function (event) {
    event.preventDefault();
    ara();
});
