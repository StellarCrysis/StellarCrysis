// Локализует строки
export class Localizator {
    // Локаль
    private static _locale: string = "ru"

    // Данные по строкам
    private static _data = new Map<string, Map<string, string>>();    

    // Устанавливает локаль
    static setLocale(locale: string) {
        Localizator._locale = locale
    }

    // Устанавливает данные локали
    static setLocaleData(data : Map<string, Map<string, string>>) {
        Localizator._data = data
    }

    // Возвращает строку для текущей локали
    static getString(key: string): string {
        return Localizator._data[key]
    }
}