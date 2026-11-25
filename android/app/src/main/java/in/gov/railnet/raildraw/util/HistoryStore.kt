package `in`.gov.railnet.raildraw.util

import android.content.Context
import `in`.gov.railnet.raildraw.model.DrawingVariant
import org.json.JSONArray
import org.json.JSONObject
import java.text.SimpleDateFormat
import java.util.*

data class DrawingHistoryItem(
    val id: String,
    val title: String,
    val prompt: String,
    val variantName: String,
    val timestamp: String
) {
    val variant: DrawingVariant
        get() = DrawingVariant.entries.firstOrNull { it.name == variantName } ?: DrawingVariant.ROUTE_PLAN
}

object HistoryStore {
    private const val PREFS_NAME = "raildraw_history_prefs"
    private const val KEY_HISTORY = "past_drawings_json"
    private const val MAX_ITEMS = 30

    fun getHistory(context: Context): List<DrawingHistoryItem> {
        val raw = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .getString(KEY_HISTORY, null) ?: return emptyList()
        return try {
            val arr = JSONArray(raw)
            buildList {
                for (i in 0 until arr.length()) {
                    val obj = arr.optJSONObject(i) ?: continue
                    add(
                        DrawingHistoryItem(
                            id = obj.optString("id", UUID.randomUUID().toString()),
                            title = obj.optString("title", "Signalling Drawing"),
                            prompt = obj.optString("prompt", ""),
                            variantName = obj.optString("variantName", DrawingVariant.ROUTE_PLAN.name),
                            timestamp = obj.optString("timestamp", "")
                        )
                    )
                }
            }
        } catch (_: Exception) {
            emptyList()
        }
    }

    fun addEntry(
        context: Context,
        title: String,
        prompt: String,
        variant: DrawingVariant
    ): List<DrawingHistoryItem> {
        val current = getHistory(context).toMutableList()
        current.removeAll { it.prompt.equals(prompt.trim(), ignoreCase = true) && it.variant == variant }
        val now = SimpleDateFormat("dd MMM, HH:mm", Locale.getDefault()).format(Date())
        current.add(
            0,
            DrawingHistoryItem(
                id = UUID.randomUUID().toString(),
                title = title,
                prompt = prompt.trim(),
                variantName = variant.name,
                timestamp = now
            )
        )
        val trimmed = current.take(MAX_ITEMS)
        saveList(context, trimmed)
        return trimmed
    }

    fun deleteEntry(context: Context, id: String): List<DrawingHistoryItem> {
        val updated = getHistory(context).filterNot { it.id == id }
        saveList(context, updated)
        return updated
    }

    fun clearAll(context: Context): List<DrawingHistoryItem> {
        saveList(context, emptyList())
        return emptyList()
    }

    private fun saveList(context: Context, items: List<DrawingHistoryItem>) {
        val arr = JSONArray()
        items.forEach { item ->
            arr.put(
                JSONObject().apply {
                    put("id", item.id)
                    put("title", item.title)
                    put("prompt", item.prompt)
                    put("variantName", item.variantName)
                    put("timestamp", item.timestamp)
                }
            )
        }
        context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)
            .edit()
            .putString(KEY_HISTORY, arr.toString())
            .apply()
    }
}
