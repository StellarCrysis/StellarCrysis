// Освобождает ресурсы
export class Disposer {
    // Обозреватели для освобождения
    private _observersToDispose = []

    // Объекты которые можно освободить
    private _disposables = []

    // Добавляет обозреватель для освобождения
    addObserverToDispose(observer) {
        this._observersToDispose.push(observer)
    }

    // Добавляет освобождаемый объект
    addDisposableToDispose(disposable) {
        this._disposables.push(disposable)
    }

    // Освобождает ресурсы
    disposeAll() {
        if (this._observersToDispose != null) {
            this._observersToDispose.forEach(x => {
                x.unregisterOnNextCall
            })
        }

        if (this._disposables != null) {
            this._disposables.forEach(x => {
                x.dispose()
            })
        }

        this._observersToDispose = null
        this._disposables = null
    }
}